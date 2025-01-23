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

    // Fetch country data and initialize select2 for countries
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            let countryList = data.map(country => ({
                id: country.cca2,
                text: country.name.common
            }));

            $('#country').select2({
                placeholder: "Select a country",
                data: countryList,
                allowClear: true,
                matcher: function (params, data) {
                    if ($.trim(params.term) === '') {
                        return data;
                    }
                    if (data.text.toLowerCase().includes(params.term.toLowerCase())) {
                        return data;
                    }
                    return null;
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

            // Fetch and populate states and cities for national travel (e.g., United States)
            fetch('https://countriesnow.space/api/v0.1/countries/states')
                .then(response => response.json())
                .then(data => {
                    let states = data.data.find(country => country.name === 'United States').states;
                    let stateList = states.map(state => ({
                        id: state.name,
                        text: state.name
                    }));

                    $('#state').select2({
                        placeholder: "Select a state",
                        data: stateList,
                        allowClear: true
                    });

                    $('#state').on('change', function () {
                        let selectedState = $(this).val();
                        fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ country: 'United States', state: selectedState })
                        })
                            .then(response => response.json())
                            .then(cityData => {
                                let cityList = cityData.data.map(city => ({
                                    id: city,
                                    text: city
                                }));

                                $('#city').empty().select2({
                                    data: cityList,
                                    placeholder: "Select a city",
                                    allowClear: true
                                });
                            })
                            .catch(error => console.error('Error fetching city data:', error));
                    });
                })
                .catch(error => console.error('Error fetching state data:', error));
        } else if (travelType === 'international') {
            locationFields.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="country_optional">Country (Optional):</label>
                        <select id="country_optional" name="country_optional" style="width: 100%;">
                            <option value="">Select an optional country</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="state">State (Optional):</label>
                        <select id="state" name="state" style="width: 100%;">
                            <option value="">Select a state</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="city">City (Optional):</label>
                        <select id="city" name="city" style="width: 100%;">
                            <option value="">Select a city</option>
                        </select>
                    </div>
                </div>
            `;

            // Fetch and populate countries
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
                        fetch('https://countriesnow.space/api/v0.1/countries/states')
                            .then(response => response.json())
                            .then(data => {
                                let countryData = data.data.find(c => c.name === selectedCountry);
                                if (countryData) {
                                    let stateList = countryData.states.map(state => ({
                                        id: state.name,
                                        text: state.name
                                    }));

                                    $('#state').empty().select2({
                                        data: stateList,
                                        placeholder: "Select a state",
                                        allowClear: true
                                    });

                                    $('#state').on('change', function () {
                                        let selectedState = $(this).val();
                                        fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ country: selectedCountry, state: selectedState })
                                        })
                                            .then(response => response.json())
                                            .then(cityData => {
                                                let cityList = cityData.data.map(city => ({
                                                    id: city,
                                                    text: city
                                                }));

                                                $('#city').empty().select2({
                                                    data: cityList,
                                                    placeholder: "Select a city",
                                                    allowClear: true
                                                });
                                            });
                                    });
                                }
                            });
                    });
                });
        }
    });
});
