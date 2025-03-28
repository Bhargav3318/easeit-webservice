document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    // Set minimum selectable dates
    document.getElementById("start_date").min = formattedDate;
    document.getElementById("end_date").min = formattedDate;
    document.getElementById("start_date").addEventListener("change", function () {
        document.getElementById("end_date").min = this.value;
    });

    // Load country list once and populate country dropdown
    let countryListData = [];
    fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            countryListData = data.map(country => ({
                id: country.name.common,
                text: country.name.common
            }));
            // Initialize main country select with Select2 for searchability
            $("#country").select2({
                placeholder: "Select a country",
                data: countryListData,
                allowClear: true
            });
            // When a country is chosen, load its states if needed (for national travel)
            $("#country").on("change", function () {
                const selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, "state", "city");
                }
            });
        })
        .catch(err => console.error("Error fetching country data:", err));

    // Handle dynamic location fields based on travel type selection
    document.getElementById("travel_type").addEventListener("change", function () {
        const travelType = this.value;
        const locationFields = document.getElementById("location-fields");
        locationFields.innerHTML = "";  // Clear any previous fields
        if (travelType === "national") {
            // Show state and city selectors for national travel
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="state">State (Optional):</label>
                        <select id="state" name="state" style="width: 100%;">
                            <option value="">Select a state</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="city">City/Town (Optional):</label>
                        <select id="city" name="city" style="width: 100%;">
                            <option value="">Select a city</option>
                        </select>
                    </div>
                </div>
            `;
            // If a country is already selected, populate its states immediately
            const selectedCountry = $("#country").val();
            if (selectedCountry) {
                populateStates(selectedCountry, "state", "city");
            }
        } else if (travelType === "international") {
            // Show country (optional second country), state, and city for international travel
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="country_optional">Country (Optional):</label>
                        <select id="country_optional" name="country_optional" style="width: 100%;">
                            <option value="">Select an optional country</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="state_international">State (Optional):</label>
                        <select id="state_international" name="state" style="width: 100%;">
                            <option value="">Select a state</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="city_international">City (Optional):</label>
                        <select id="city_international" name="city" style="width: 100%;">
                            <option value="">Select a city</option>
                        </select>
                    </div>
                </div>
            `;
            // Initialize the optional country selector using the loaded country list
            if (countryListData.length) {
                $("#country_optional").select2({
                    placeholder: "Select an optional country",
                    data: countryListData,
                    allowClear: true
                });
            } else {
                // Fallback fetch if country data not loaded yet (unlikely to happen due to initial fetch)
                fetch("https://restcountries.com/v3.1/all")
                    .then(response => response.json())
                    .then(data => {
                        const countryOptions = data.map(country => ({
                            id: country.name.common,
                            text: country.name.common
                        }));
                        $("#country_optional").select2({
                            placeholder: "Select an optional country",
                            data: countryOptions,
                            allowClear: true
                        });
                    })
                    .catch(err => console.error("Error fetching country data:", err));
            }
            // When an optional country is selected, populate its states and cities
            $("#country_optional").on("change", function () {
                const selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, "state_international", "city_international");
                }
            });
        }
    });

    // Fetch and populate states for a given country into the specified state and city select elements
    function populateStates(countryName, stateSelectId, citySelectId) {
        fetch("https://countriesnow.space/api/v0.1/countries/states")
            .then(response => response.json())
            .then(data => {
                const countryData = data.data.find(
                    c => c.name.toLowerCase() === countryName.toLowerCase()
                );
                if (countryData) {
                    const stateList = countryData.states.map(s => ({
                        id: s.name,
                        text: s.name
                    }));
                    // Populate state dropdown with Select2
                    $(`#${stateSelectId}`).empty().select2({
                        data: stateList,
                        placeholder: "Select a state",
                        allowClear: true
                    });
                    // When a state is selected, load its cities
                    $(`#${stateSelectId}`).on("change", function () {
                        const selectedState = $(this).val();
                        populateCities(countryName, selectedState, citySelectId);
                    });
                } else {
                    console.error("No states found for selected country:", countryName);
                }
            })
            .catch(err => console.error("Error fetching states:", err));
    }

    // Fetch and populate cities for a given state into the specified city select element
    function populateCities(countryName, stateName, citySelectId) {
        fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: countryName, state: stateName })
        })
            .then(response => response.json())
            .then(data => {
                const cityList = (data.data || []).map(city => ({
                    id: city,
                    text: city
                }));
                // Populate city dropdown with Select2
                $(`#${citySelectId}`).empty().select2({
                    data: cityList,
                    placeholder: "Select a city",
                    allowClear: true
                });
            })
            .catch(err =>
                console.error(`Error fetching cities for ${stateName}:`, err)
            );
    }
});
