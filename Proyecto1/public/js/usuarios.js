document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.user-card-wrapper').forEach(function (wrapper) {
        const collapsed = wrapper.querySelector('.card-collapsed');
        const expanded  = wrapper.querySelector('.card-expanded');
        const btnShow   = wrapper.querySelector('.btn-show-details');
        const btnHide   = wrapper.querySelector('.btn-hide-details');

        btnShow.addEventListener('click', function () {
            collapsed.classList.add('hidden');
            expanded.classList.remove('hidden');
        });

        btnHide.addEventListener('click', function () {
            expanded.classList.add('hidden');
            collapsed.classList.remove('hidden');
        });
    });
});