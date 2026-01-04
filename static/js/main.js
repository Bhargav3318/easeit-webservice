document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    document.getElementById("start_date").min = formattedDate;
    document.getElementById("end_date").min = formattedDate;

    document.getElementById("start_date").addEventListener("change", function () {
        document.getElementById("end_date").min = this.value;
    });

    let countryListData = [];

    // Fetch country list once and cache it
    fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            countryListData = data.map(country => ({
                id: country.name.common,
                text: country.name.common
            }));
            initializeSelect2("#country", countryListData, "Select a country");
        })
        .catch(err => console.error("Error fetching country data:", err));

    document.getElementById("travel_type").addEventListener("change", function () {
        const travelType = this.value;
        const locationFields = document.getElementById("location-fields");
        locationFields.innerHTML = "";

        if (travelType === "national") {
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="state">State (Optional):</label>
                        <select id="state" name="state" style="width: 100%;"></select>
                    </div>
                    <div class="form-group">
                        <label for="city">City/Town (Optional):</label>
                        <select id="city" name="city" style="width: 100%;"></select>
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
                        <select id="country_optional" name="country_optional" style="width: 100%;"></select>
                    </div>
                </div>
            `;
            initializeSelect2("#country_optional", countryListData, "Select an optional country");
        }
    });

    function populateStates(countryName, stateSelectId, citySelectId) {
        fetch("https://countriesnow.space/api/v0.1/countries/states")
            .then(response => response.json())
            .then(data => {
                const countryData = data.data.find(
                    c => c.name.trim().toLowerCase() === countryName.trim().toLowerCase()
                );
                if (countryData) {
                    const stateList = countryData.states.map(s => ({
                        id: s.name,
                        text: s.name
                    }));
                    initializeSelect2(`#${stateSelectId}`, stateList, "Select a state");
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
                initializeSelect2(`#${citySelectId}`, cityList, "Select a city");
            })
            .catch(err =>
                console.error(`Error fetching cities for ${stateName}:`, err)
            );
    }

    function initializeSelect2(selector, data, placeholder) {
        $(selector).select2({
            data: data,
            placeholder: placeholder,
            allowClear: true
        });
    }
});