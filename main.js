let scheduleData = {};
let currentYear = 2026;
let currentMonth = 6; // 0 = January

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
        if (scheduleData[dateStr] && scheduleData[dateStr].slots) {
            const slots = scheduleData[dateStr].slots;
            const statusContainer = document.createElement('div');
            statusContainer.className = 'status-container';
            
            // 最大2つまで表示
            const displaySlots = slots.slice(0, 2);
            displaySlots.forEach(slot => {
                const statusEl = document.createElement('div');
                statusEl.className = 'day-status';
                
                if (slot.status === '空き') {
                    statusEl.classList.add('status-available');
                    statusEl.textContent = slot.time ? `空き ${slot.time}` : '空き';
                } else if (slot.status === '予約済') {
                    statusEl.classList.add('status-booked');
                    statusEl.textContent = slot.time ? `予約済` : '予約済';
                } else if (slot.status === '対応不可') {
                    statusEl.classList.add('status-unavailable');
                    statusEl.textContent = slot.time ? `対応不可` : '対応不可';
                } else if (slot.status === '日程調整中') {
                    statusEl.classList.add('status-adjusting');
                    statusEl.textContent = slot.time ? `日程調整中` : '日程調整中';
                }

                statusContainer.appendChild(statusEl);
            });
            
            // 3つ以上ある場合は「他」表示
            if (slots.length > 2) {
                const moreEl = document.createElement('div');
                moreEl.className = 'day-status status-more';
                moreEl.textContent = `他${slots.length - 2}件`;
                statusContainer.appendChild(moreEl);
            }
            
            dayCell.appendChild(statusContainer);
            
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
    
    if (data && data.slots) {
        let detailHtml = '<ul class="detail-list">';
        
        data.slots.forEach(slot => {
            let text = '';
            if (slot.status === '空き') {
                text = `<span class="detail-status status-available">空き</span>`;
                if (slot.time) text += ` ${slot.time}`;
            } else if (slot.status === '予約済') {
                text = `<span class="detail-status status-booked">予約済</span>`;
                if (slot.time) text += ` ${slot.time}`;
            } else if (slot.status === '対応不可') {
                text = `<span class="detail-status status-unavailable">対応不可</span>`;
                if (slot.time) text += ` ${slot.time}`;
            } else if (slot.status === '日程調整中') {
                text = `<span class="detail-status status-adjusting">日程調整中</span>`;
                if (slot.time) text += ` ${slot.time}`;
            }
            detailHtml += `<li>${text}</li>`;
        });
        
        detailHtml += '</ul>';
        detailInfo.innerHTML = detailHtml;
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