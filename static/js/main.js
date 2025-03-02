document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Set minimum date for travel dates
    document.getElementById('start_date').setAttribute('min', formattedDate);
    document.getElementById('end_date').setAttribute('min', formattedDate);

    // Update end date based on start date selection
    document.getElementById('start_date').addEventListener('change', function () {
        document.getElementById('end_date').setAttribute('min', this.value);
    });

    // Fetch and populate countries
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            let countryList = data.map(country => ({
                id: country.name.common,
                text: country.name.common
            }));

            $('#country').select2({
                placeholder: "Select a country",
                data: countryList,
                allowClear: true
            });

            $('#country_optional').select2({
                placeholder: "Select an optional country",
                data: countryList,
                allowClear: true
            });

            $('#country').on('change', function () {
                let selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, 'state', 'city');
                }
            });

            $(document).on('change', '#country_optional', function () {
                let selectedCountry = $(this).val();
                if (selectedCountry) {
                    populateStates(selectedCountry, 'state_international', 'city_international');
                }
            });
        })
        .catch(error => console.error('Error fetching country data:', error));

    // Handle travel type selection dynamically
    document.getElementById('travel_type').addEventListener('change', function () {
        const travelType = this.value;
        const locationFields = document.getElementById('location-fields');
        locationFields.innerHTML = '';

        if (travelType === 'national') {
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

            let selectedCountry = $('#country').val();
            if (selectedCountry) {
                populateStates(selectedCountry, 'state', 'city');
            }
        } else if (travelType === 'international') {
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="country_optional">Country (Optional):</label>
                        <select id="country_optional" name="country_optional" style="width: 100%;" required>
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

            // Reinitialize select2 for newly added elements
            fetch('https://restcountries.com/v3.1/all')
                .then(response => response.json())
                .then(data => {
                    let countryList = data.map(country => ({
                        id: country.name.common,
                        text: country.name.common
                    }));

                    $('#country_optional').select2({
                        placeholder: "Select an optional country",
                        data: countryList,
                        allowClear: true
                    });

                    $('#country_optional').on('change', function () {
                        let selectedCountry = $(this).val();
                        if (selectedCountry) {
                            populateStates(selectedCountry, 'state_international', 'city_international');
                        }
                    });
                })
                .catch(error => console.error('Error fetching country data:', error));
        }
    });

    // Function to fetch and populate states based on the selected country
    function populateStates(countryName, stateId, cityId) {
        fetch('https://countriesnow.space/api/v0.1/countries/states')
            .then(response => response.json())
            .then(data => {
                let countryData = data.data.find(c => c.name.toLowerCase() === countryName.toLowerCase());
                if (countryData) {
                    let stateList = countryData.states.map(state => ({
                        id: state.name,
                        text: state.name
                    }));

                    $(`#${stateId}`).empty().select2({
                        data: stateList,
                        placeholder: "Select a state",
                        allowClear: true
                    });

                    $(`#${stateId}`).on('change', function () {
                        let selectedState = $(this).val();
                        populateCities(countryName, selectedState, cityId);
                    });
                } else {
                    console.error("No states found for selected country");
                }
            })
            .catch(error => console.error('Error fetching states:', error));
    }

    // Function to fetch and populate cities based on the selected state
    function populateCities(countryName, stateName, cityId) {
        fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: countryName, state: stateName })
        })
        .then(response => response.json())
        .then(cityData => {
            let cityList = cityData.data.map(city => ({
                id: city,
                text: city
            }));

            $(`#${cityId}`).empty().select2({
                data: cityList,
                placeholder: "Select a city",
                allowClear: true
            });
        })
        .catch(error => console.error(`Error fetching cities for ${stateName}:`, error));
    }
});
