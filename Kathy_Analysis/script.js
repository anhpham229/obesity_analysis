document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("lineChart").getContext("2d");
    let lineChart; // Store chart instance
    let jsonData = []; // Store loaded JSON data

    const stateSelect = document.getElementById("state-select");
    const topicSelect = document.getElementById("topic-select");

    // Function to load JSON data using Fetch API
    function loadJsonData() {
        fetch("Chronic_Disease_Indicators_Avg.json")
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
        const uniqueStates = [...new Set(jsonData.map(entry => entry.LocationDesc))].sort();
        const uniqueTopics = [...new Set(jsonData.map(entry => entry.CDI_Topic))].sort();

        if (uniqueStates.length === 0 || uniqueTopics.length === 0) {
            console.error("No unique states or topics found.");
            alert("Data missing for states or topics.");
            return;
        }

        console.log("States Loaded:", uniqueStates); // Debugging
        console.log("Topics Loaded:", uniqueTopics); // Debugging

        // Populate State dropdown
        stateSelect.innerHTML = uniqueStates.map(state => `<option value="${state}">${state}</option>`).join("");

        // Populate Topic dropdown
        topicSelect.innerHTML = uniqueTopics.map(topic => `<option value="${topic}">${topic}</option>`).join("");

        // Set default selections and update chart
        stateSelect.value = uniqueStates[0];
        topicSelect.value = uniqueTopics[0];

        updateChart();
    }

    // Function to update the chart based on selected state & topic
    function updateChart() {
        const selectedState = stateSelect.value;
        const selectedTopic = topicSelect.value;

        console.log("Selected State:", selectedState); // Debugging
        console.log("Selected Topic:", selectedTopic); // Debugging

        // Filter data based on selected state and topic
        let filteredData = jsonData.filter(entry => entry.LocationDesc === selectedState && entry.CDI_Topic === selectedTopic);

        if (filteredData.length === 0) {
            console.warn("No data available for the selected State and Topic.");
            alert("No data available for this selection.");
            return;
        }

        // Ensure data is sorted chronologically (2011-2021)
        filteredData.sort((a, b) => a.YearEnd - b.YearEnd);

        // Extract YearEnd (X-axis) and avg_CDI_DataValue (Y-axis)
        const YearEnd = filteredData.map(entry => entry.YearEnd);
        const avg_CDI_DataValue = filteredData.map(entry => entry.avg_CDI_DataValue);

        console.log("Filtered & Sorted Data:", filteredData); // Debugging
        console.log("YearEnd (Chronological):", YearEnd); // Debugging
        console.log("Avg CDI Value:", avg_CDI_DataValue); // Debugging

        if (lineChart) {
            // Update existing chart with new data
            lineChart.data.labels = YearEnd;
            lineChart.data.datasets[0].data = avg_CDI_DataValue;
            lineChart.data.datasets[0].label = `${selectedTopic} in ${selectedState}`;
            lineChart.update();
        } else {
            // Create a new chart if it doesn't exist
            lineChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: YearEnd,
                    datasets: [{
                        label: `${selectedTopic} in ${selectedState}`,
                        data: avg_CDI_DataValue,
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
                                text: "Avg CDI Data Value"
                            }
                        }
                    }
                }
            });
        }
    }

    // Event listeners for dropdown changes
    stateSelect.addEventListener("change", updateChart);
    topicSelect.addEventListener("change", updateChart);

    // Load JSON data on page load
    loadJsonData();
});
