document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("barChart").getContext("2d");
    let barChart;  // Store chart instance
    let jsonData = [];  // Store loaded JSON data

    const stateSelect = document.getElementById("state-select");
    const questionSelect = document.getElementById("question-select");
    const infoPanel = document.getElementById("info-panel");  // The panel to show selected data

    // Function to load JSON data using Fetch API
    function loadJsonData() {
        fetch('nutrition_obesity_cleaned.json')  // Ensure the file path is correct
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();  // Parse JSON
            })
            .then(data => {
                jsonData = data;  // Store the data in jsonData variable
                console.log("JSON Data Loaded:", jsonData);  // Log the loaded data
                populateDropdowns();  // Populate dropdowns with unique values
            })
            .catch(error => {
                console.error("Error loading JSON data:", error);
                alert("Failed to load data. Check console for errors.");
            });
    }

    // Function to populate dropdowns with unique values
    function populateDropdowns() {
        const uniqueStates = [...new Set(jsonData.map(entry => entry.State))].sort();
        const uniqueQuestions = [...new Set(jsonData.map(entry => entry.Question))].sort();

        console.log("Unique States:", uniqueStates);
        console.log("Unique Questions:", uniqueQuestions);

        if (uniqueStates.length === 0 || uniqueQuestions.length === 0) {
            console.error("No unique states or questions found.");
            alert("Data missing for states or questions.");
            return;
        }

        stateSelect.innerHTML = uniqueStates.map(state => `<option value="${state}">${state}</option>`).join("");
        questionSelect.innerHTML = uniqueQuestions.map(question => `<option value="${question}">${question}</option>`).join("");

        stateSelect.value = uniqueStates[0];
        questionSelect.value = uniqueQuestions[0];

        updateChart();  // Update chart based on initial selection
        updateInfoPanel();  // Update the info panel with the initial data
    }

    // Function to update the chart and info panel based on selected state & topic
    function updateChart() {
        const selectedState = stateSelect.value;
        const selectedQuestion = questionSelect.value;

        console.log("Selected State:", selectedState);
        console.log("Selected Question:", selectedQuestion);

        let filteredData = jsonData.filter(entry => entry.State === selectedState && entry.Question === selectedQuestion);

        if (filteredData.length === 0) {
            alert("No data available for the selected State and Question.");
            return;
        }

        filteredData = filteredData.filter(entry => entry.Year >= 2011 && entry.Year <= 2021);
        filteredData.sort((a, b) => a.Year - b.Year);

        const years = filteredData.map(entry => entry.Year);
        const weightedDataValues = filteredData.map(entry => entry.Weighted_Data_Value);
        const lowConfidenceLimits = filteredData.map(entry => entry.Weighted_Low_Confidence_Limit);
        const highConfidenceLimits = filteredData.map(entry => entry.Weighted_High_Confidence_Limit);

        if (barChart) {
            barChart.data.labels = years;
            barChart.data.datasets[0].data = weightedDataValues;
            barChart.data.datasets[1].data = lowConfidenceLimits;
            barChart.data.datasets[2].data = highConfidenceLimits;
            barChart.update();
        } else {
            barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: years,
                    datasets: [{
                        label: `${selectedQuestion} - Average Data Value`,
                        data: weightedDataValues,
                        backgroundColor: 'rgba(0,123,255,0.6)',
                        borderColor: 'rgba(0,123,255,1)',
                        borderWidth: 1
                    }, {
                        label: `${selectedQuestion} - Average Low Confidence Limit`,
                        data: lowConfidenceLimits,
                        backgroundColor: 'rgba(255,99,132,0.6)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                    }, {
                        label: `${selectedQuestion} - Average High Confidence Limit`,
                        data: highConfidenceLimits,
                        backgroundColor: 'rgba(75,192,192,0.6)',
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Values'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Update the information panel with the first year's data
        updateInfoPanel(filteredData[0]);
    }

    // Function to update the info panel with the first data entry from the filtered results
    function updateInfoPanel(data) {
        if (!data) return;

        // Show the panel
        infoPanel.style.display = 'block';

        // Update the panel content
        document.getElementById("selected-state").textContent = data.State;
        document.getElementById("selected-question").textContent = data.Question;
        document.getElementById("selected-year").textContent = data.Year;
        document.getElementById("weighted-data-value").textContent = data.Weighted_Data_Value.toFixed(2);
        document.getElementById("low-confidence").textContent = data.Weighted_Low_Confidence_Limit.toFixed(2);
        document.getElementById("high-confidence").textContent = data.Weighted_High_Confidence_Limit.toFixed(2);
        document.getElementById("sample-size").textContent = data.Total_Sample_Size;
    }

    // Event listeners for dropdown changes
    stateSelect.addEventListener('change', updateChart);
    questionSelect.addEventListener('change', updateChart);

    // Load JSON data when the page is loaded
    loadJsonData();
});