document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const startDate = document.getElementById('start_date');
    const endDate = document.getElementById('end_date');
    const budget = document.getElementById('budget');
    const adults = document.getElementById('adults');
    const children = document.getElementById('children');

    // Set minimum date as today for start date
    const today = new Date().toISOString().split('T')[0];
    startDate.setAttribute('min', today);

    // Update end date minimum when start date changes
    startDate.addEventListener('change', function() {
        endDate.setAttribute('min', this.value);
        if (endDate.value && endDate.value < this.value) {
            endDate.value = this.value;
        }
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        // Validate dates
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (end < start) {
            e.preventDefault();
            alert('End date cannot be before start date!');
            return;
        }

        // Validate budget
        if (parseFloat(budget.value) <= 0) {
            e.preventDefault();
            alert('Budget must be greater than 0!');
            return;
        }

        // Validate number of people
        if (parseInt(adults.value) < 1) {
            e.preventDefault();
            alert('Number of adults must be at least 1!');
            return;
        }

        if (parseInt(children.value) < 0) {
            e.preventDefault();
            alert('Number of children cannot be negative!');
            return;
        }
    });

    // Format budget input
    budget.addEventListener('blur', function() {
        if (this.value) {
            this.value = parseFloat(this.value).toFixed(2);
        }
    });
});