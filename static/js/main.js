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
            $("#country").select2({
                placeholder: "Select a country",
                data: countryListData,
                allowClear: true
            });
            $("#country").on("change", function () {
                const selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, "state", "city");
                }
            });
        })
        .catch(err => console.error("Error fetching country data:", err));

    document.getElementById("travel_type").addEventListener("change", function () {
        const travelType = this.value;

        // Reset country and state fields when travel type changes
        const countrySelect = document.getElementById("country");
        if (countrySelect) {
            $(countrySelect).val(null).trigger("change");
        }

        const locationFields = document.getElementById("location-fields");
        locationFields.innerHTML = "";
        if (travelType === "national") {
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="state">State (Optional):</label>
                        <select id="state" name="state" style="width: 100%;">
                            <option value=""disabled selected>Select a state</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="city">City/Town (Optional):</label>
                        <select id="city" name="city" style="width: 100%;">
                            <option value=""disabled selected>Select a city</option>
                        </select>
                    </div>
                </div>
            `;
            const selectedCountry = $("#country").val();
            if (selectedCountry) {
                populateStates(selectedCountry, "state", "city");
            }
        } else if (travelType === "international") {
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="country_optional">Country (Optional):</label>
                        <select id="country_optional" name="country_optional" style="width: 100%;">
                            <option value=""disabled selected>Select an optional country</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="state_international">State (Optional):</label>
                        <select id="state_international" name="state" style="width: 100%;">
                            <option value=""disabled selected>Select a state</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="city_international">City (Optional):</label>
                        <select id="city_international" name="city" style="width: 100%;">
                            <option value=""disabled selected>Select a city</option>
                        </select>
                    </div>
                </div>
            `;
            if (countryListData.length) {
                $("#country_optional").select2({
                    placeholder: "Select an optional country",
                    data: countryListData,
                    allowClear: true
                });
            } else {
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

            $("#country_optional").on("change", function () {
                const selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, "state_international", "city_international");
                }
            });
        }
    });

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
                    $(`#${stateSelectId}`).empty().select2({
                        data: stateList,
                        placeholder: "Select a state",
                        allowClear: true
                    });
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
