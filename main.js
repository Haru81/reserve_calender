let scheduleData = {};
let currentYear = 2026;
let currentMonth = 0; // 0 = January

const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];

// JSONデータを読み込む
fetch('schedule.json')
    .then(response => response.json())
    .then(data => {
        scheduleData = data;
        renderCalendar();
    })
    .catch(error => {
        console.error('スケジュールデータの読み込みに失敗しました:', error);
        renderCalendar();
    });

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('currentMonth');
    
    calendar.innerHTML = '';
    currentMonthEl.textContent = `${currentYear}年 ${currentMonth + 1}月`;
    
    // 曜日ヘッダー
    dayHeaders.forEach((day, index) => {
        const header = document.createElement('div');
        header.className = 'day-header';
        if (index === 0) header.classList.add('sunday');
        if (index === 6) header.classList.add('saturday');
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // 月の最初の日と最後の日を取得
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // 空セルを追加
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        calendar.appendChild(emptyCell);
    }
    
    // 日付セルを追加
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        if (dayOfWeek === 0) dayCell.classList.add('sunday');
        if (dayOfWeek === 6) dayCell.classList.add('saturday');
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // スケジュールデータがあれば表示
        if (scheduleData[dateStr]) {
            const status = scheduleData[dateStr].status;
            const statusEl = document.createElement('div');
            statusEl.className = 'day-status';
            
            if (status === '空き') {
                statusEl.classList.add('status-available');
                statusEl.textContent = '空き';
            } else if (status === '予約済') {
                statusEl.classList.add('status-booked');
                statusEl.textContent = '予約済';
            } else if (status === '対応不可') {
                statusEl.classList.add('status-unavailable');
                statusEl.textContent = '対応不可';
            }
            
            dayCell.appendChild(statusEl);
            
            // クリックイベント
            dayCell.addEventListener('click', () => showDetail(dateStr, day));
        }
        
        calendar.appendChild(dayCell);
    }
}

function showDetail(dateStr, day) {
    const detailPanel = document.getElementById('detailPanel');
    const detailDate = document.getElementById('detailDate');
    const detailInfo = document.getElementById('detailInfo');
    
    const data = scheduleData[dateStr];
    
    detailDate.textContent = `${currentYear}年${currentMonth + 1}月${day}日`;
    
    if (data.status === '空き' && data.time) {
        detailInfo.textContent = `対応可能時間: ${data.time}`;
    } else if (data.status === '予約済' && data.time) {
        detailInfo.textContent = `${data.time} 実験予約済み`;
    } else if (data.status === '対応不可') {
        detailInfo.textContent = 'この日は対応できません';
    }
    
    detailPanel.classList.add('active');
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    if (currentYear < 2026 || (currentYear === 2026 && currentMonth < 0)) {
        currentYear = 2026;
        currentMonth = 0;
        return;
    }
    document.getElementById('detailPanel').classList.remove('active');
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    if (currentYear > 2026) {
        currentYear = 2026;
        currentMonth = 11;
        return;
    }
    document.getElementById('detailPanel').classList.remove('active');
    renderCalendar();
});