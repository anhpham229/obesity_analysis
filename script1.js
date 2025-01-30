document.addEventListener("DOMContentLoaded", function () {
    const stateSelect = document.getElementById("state-select");
    const questionSelect = document.getElementById("question-select");

    let jsonData = [];

    // Load JSON data using Fetch API
    function loadJsonData() {
        fetch('nutrition_obesity_cleaned.json')  // Ensure the file path is correct
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                populateDropdowns();
            })
            .catch(error => {
                console.error("Error loading JSON data:", error);
                alert("Failed to load data. Check console for errors.");
            });
    }

    // Populate dropdowns with unique states and questions
    function populateDropdowns() {
        const uniqueStates = [...new Set(jsonData.map(entry => entry.State))].sort();
        const uniqueQuestions = [...new Set(jsonData.map(entry => entry.Question))].sort();

        // Populate State dropdown
        stateSelect.innerHTML = uniqueStates.map(state => `<option value="${state}">${state}</option>`).join("");
        
        // Populate Question dropdown
        questionSelect.innerHTML = uniqueQuestions.map(question => `<option value="${question}">${question}</option>`).join("");

        // Set default selections and update chart
        stateSelect.value = uniqueStates[0];
        questionSelect.value = uniqueQuestions[0];

        // Load initial chart
        updateCharts();
    }

    // Function to update both charts based on selected state and question
    function updateCharts() {
        const selectedState = stateSelect.value;
        const selectedQuestion = questionSelect.value;

        // Filter the data based on selected state and question
        const filteredData = jsonData.filter(entry => entry.State === selectedState && entry.Question === selectedQuestion);

        if (filteredData.length === 0) {
            alert("No data available for this selection.");
            return;
        }

        // Prepare data for both charts
        const years = filteredData.map(entry => entry.Year);
        const weightedData = filteredData.map(entry => entry.Weighted_Data_Value);
        const totalSample = filteredData.map(entry => entry.Total_Sample_Size);
        const highConfidence = filteredData.map(entry => entry.Weighted_High_Confidence_Limit);
        const lowConfidence = filteredData.map(entry => entry.Weighted_Low_Confidence_Limit);

        // Bubble Chart - Years vs Total Sample Size with bubble size as Weighted Data Value
        const bubbleChartData = [{
            x: years,
            y: totalSample,
            mode: 'markers',
            marker: {
                size: weightedData,  // Bubble size based on Weighted Data Value
                color: weightedData,
            },
            text: years.map((year, index) => `Year: ${year}<br>Total Sample: ${totalSample[index]}<br>Average Data Value: ${weightedData[index]}`),
            type: 'scatter'
        }];

        const bubbleChartLayout = {
            title: `${selectedQuestion}<br>Total Sample vs Year`,
            xaxis: { title: 'Year' },
            yaxis: { title: 'Total Sample Size' },
            showlegend: false
        };

        // Bar Chart - Multiple bars for Weighted Data Value, High Confidence, Low Confidence
        const barChartData = [
            {
                x: years,
                y: weightedData,
                type: 'bar',
                name: 'Average Data Value',
                marker: { color: '#73b2ff' }
            },
            {
                x: years,
                y: highConfidence,
                type: 'bar',
                name: 'Average High Confidence Limit',
                marker: { color: '#fea3b8' }
            },
            {
                x: years,
                y: lowConfidence,
                type: 'bar',
                name: 'Average Low Confidence Limit',
                marker: { color: '#98d9da' }
            }
        ];

        const barChartLayout = {
            title: `${selectedQuestion}<br>Data Value and Confidence Levels vs Year`,
            barmode: 'group',
            xaxis: { title: 'Year' },
            yaxis: { title: 'Value' },
            showlegend: true
        };

        // Plot the bubble chart
        Plotly.newPlot('bubble-chart', bubbleChartData, bubbleChartLayout);

        // Plot the bar chart
        Plotly.newPlot('bar-chart', barChartData, barChartLayout);
    }

    // Event listeners for dropdown changes
    stateSelect.addEventListener('change', updateCharts);
    questionSelect.addEventListener('change', updateCharts);

    // Load JSON data on page load
    loadJsonData();
});