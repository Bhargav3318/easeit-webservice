document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    document.getElementById("start_date").min = formattedDate;
    document.getElementById("end_date").min = formattedDate;

    document.getElementById("start_date").addEventListener("change", function () {
        document.getElementById("end_date").min = this.value;
    });

    let countryListData = [];
    const API_KEY = "076087df8e29814435f33d7bed74c7e9f929d28a7baa8bff84a76efa8e570c9d"; // Replace with your CountryStateCity API key

    // Fetch country list once and cache it
    fetch("https://api.countrystatecity.in/v1/countries", {
        headers: { "X-CSCAPI-KEY": API_KEY }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch country data");
            }
            return response.json();
        })
        .then(data => {
            countryListData = data.map(country => ({
                id: country.iso2,
                text: country.name
            }));
            initializeSelect2("#country", countryListData, "Select a country");
        })
        .catch(err => {
            console.error("Error fetching country data:", err);
            alert("Failed to load country data. Please try again later.");
        });

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

    function populateStates(countryIso2, stateSelectId, citySelectId) {
        fetch(`https://api.countrystatecity.in/v1/countries/${countryIso2}/states`, {
            headers: { "X-CSCAPI-KEY": API_KEY }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch states");
                }
                return response.json();
            })
            .then(data => {
                const stateList = data.map(state => ({
                    id: state.iso2,
                    text: state.name
                }));
                initializeSelect2(`#${stateSelectId}`, stateList, "Select a state");
                $(`#${stateSelectId}`).on("change", function () {
                    const selectedState = $(this).val();
                    populateCities(countryIso2, selectedState, citySelectId);
                });
            })
            .catch(err => {
                console.error("Error fetching states:", err);
                alert("Failed to load states. Please try again later.");
            });
    }

    function populateCities(countryIso2, stateIso2, citySelectId) {
        fetch(`https://api.countrystatecity.in/v1/countries/${countryIso2}/states/${stateIso2}/cities`, {
            headers: { "X-CSCAPI-KEY": API_KEY }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch cities");
                }
                return response.json();
            })
            .then(data => {
                const cityList = data.map(city => ({
                    id: city.name,
                    text: city.name
                }));
                initializeSelect2(`#${citySelectId}`, cityList, "Select a city");
            })
            .catch(err => {
                console.error(`Error fetching cities for ${stateIso2}:`, err);
                alert("Failed to load cities. Please try again later.");
            });
    }

    function initializeSelect2(selector, data, placeholder) {
        $(selector).select2({
            data: data,
            placeholder: placeholder,
            allowClear: true
        });
    }
});