const sidebar = document.querySelector('.sidebar');
const toggleButton = document.getElementById('toggleSidebar');

// Bắt sự kiện khi nút hoặc biểu tượng được nhấp vào
let last = Date.now();
toggleButton.addEventListener('click', function () {
    sidebar.classList.toggle('hidden');
    last = Date.now();
});

sidebar.addEventListener('click', function (event) {
    if (sidebar.classList.contains('hidden')
        && (Date.now() - last > 10)
    ) {
        sidebar.classList.remove('hidden');
    }
});