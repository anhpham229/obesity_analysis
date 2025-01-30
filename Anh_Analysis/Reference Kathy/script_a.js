document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("barChart").getContext("2d");
    let barChart; // Store chart instance
    let jsonData = []; // Store loaded JSON data

    const stateSelect = document.getElementById("state-select");
    const questionSelect = document.getElementById("question-select");

    // Function to load JSON data using Fetch API
    function loadJsonData() {
        fetch("nutrition_obesity_cleaned.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    console.error("No data found in JSON.");
                    alert("No data found. Please check the JSON file.");
                    return;
                }

                console.log("JSON Data Loaded:", data); // Debugging

                jsonData = data;
                populateDropdowns(); // Populate dropdowns with unique values
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

        if (uniqueStates.length === 0 || uniqueQuestions.length === 0) {
            console.error("No unique states or questions found.");
            alert("Data missing for states or questions.");
            return;
        }

        console.log("States Loaded:", uniqueStates); // Debugging
        console.log("Questions Loaded:", uniqueQuestions); // Debugging

        // Populate State dropdown
        stateSelect.innerHTML = uniqueStates.map(state => `<option value="${state}">${state}</option>`).join("");

        // Populate Question dropdown
        questionSelect.innerHTML = uniqueQuestions.map(question => `<option value="${question}">${question}</option>`).join("");

        // Set default selections and update chart
        stateSelect.value = uniqueStates[0];
        questionSelect.value = uniqueQuestions[0];

        updateChart();
    }

    // Function to update the chart based on selected state & topic
    function updateChart() {
        const selectedState = stateSelect.value;
        const selectedQuestion = questionSelect.value;

        console.log("Selected State:", selectedState); // Debugging
        console.log("Selected Question:", selectedQuestion); // Debugging

        // Filter data based on selected state and topic
        let filteredData = jsonData.filter(entry => entry.State === selectedState && entry.Question === selectedQuestion);

        if (filteredData.length === 0) {
            console.warn("No data available for the selected State and Question.");
            alert("No data available for this selection.");
            return;
        }

        // Ensure data is sorted chronologically (2011-2021)
        filteredData.sort((a, b) => a.Year - b.Year);

        // Extract Year (X-axis) and avg_CDI_DataValue (Y-axis)
        const Year = filteredData.map(entry => entry.Year);
        const Weighted_Data_Value = filteredData.map(entry => entry.Weighted_Data_Value);

        console.log("Filtered & Sorted Data:", filteredData); // Debugging
        console.log("Year (Nutrition):", Year); // Debugging
        console.log("Avg Value:", Weighted_Data_Value); // Debugging

        if (barChart) {
            // Update existing chart with new data
            barChart.data.labels = Year;
            barChart.data.datasets[0].data = Weighted_Data_Value;
            barChart.data.datasets[0].label = `${selectedQuestion} in ${selectedState}`;
            barChart.update();
        } else {
            // Create a new chart if it doesn't exist
            barChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: Year,
                    datasets: [{
                        label: `${selectedQuestion} in ${selectedState}`,
                        data: Weighted_Data_Value,
                        borderColor: "#007bff",
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Year"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Avg Data Value"
                            }
                        }
                    }
                }
            });
        }
    }

    // Event listeners for dropdown changes
    stateSelect.addEventListener("change", updateChart);
    questionSelect.addEventListener("change", updateChart);

    // Load JSON data on page load
    loadJsonData();
});
