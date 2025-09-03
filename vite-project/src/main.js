import './scss/modules.scss';

const toggleBtn = document.querySelector('.js-toggle-theme');
const body = document.querySelector('body');

toggleBtn.addEventListener('click', () => {
  const current = body.getAttribute('data-theme');
  if (current === 'dark') {
    body.setAttribute('data-theme', 'light');
	toggleBtn.classList.remove('dark')
  } else {
    body.setAttribute('data-theme', 'dark');
	toggleBtn.classList.add('dark')
  }
});

class MonthCalendar {
  constructor(root, opts = {}) {
    this.root = root;
    if (!this.root) throw new Error('MonthCalendar: root not found');

    this.opts = {
      date: new Date(),
      locale: 'ru-RU',
      ...opts
    };

    this.titleEl = this.root.querySelector('.calendar__title');
    this.gridEl  = this.root.querySelector('.calendar__grid');
    this.current = new Date(this.opts.date.getFullYear(), this.opts.date.getMonth(), 1);

    this.startDay = null;
    this.endDay = null;

    this.render();
    this.attachEvents();
  }

  render() {
    const year  = this.current.getFullYear();
    const month = this.current.getMonth();
    const daysInMonth = this.#daysInMonth(year, month);

    const formatter = new Intl.DateTimeFormat(this.opts.locale, { month: 'long' });
    const monthName = formatter.format(this.current);
    this.titleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const firstDay = new Date(year, month, 1);
    const leadingBlanks = this.#dowMonday0(firstDay);
    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
    const trailingNext = totalCells - (leadingBlanks + daysInMonth);

    this.gridEl.innerHTML = '';

    // Дни предыдущего месяца
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear  = month === 0 ? year - 1 : year;
    const daysInPrevMonth = this.#daysInMonth(prevYear, prevMonth);
    for (let i = leadingBlanks; i > 0; i--) {
		const li = document.createElement('li');
		li.className = 'calendar__day calendar__day--inactive';

		const span = document.createElement('span');
		span.classList.add('calendar__day-nr');
		span.textContent = daysInPrevMonth - i + 1;
		li.appendChild(span);

		li.dataset.date = this.#iso(prevYear, prevMonth, daysInPrevMonth - i + 1);
		this.gridEl.appendChild(li);
	}

    // Дни текущего месяца
    for (let d = 1; d <= daysInMonth; d++) {
		const li = document.createElement('li');
		li.className = 'calendar__day';

		const span = document.createElement('span');
		span.classList.add('calendar__day-nr');
		span.textContent = d;
		li.appendChild(span);

		li.dataset.date = this.#iso(year, month, d);
		this.gridEl.appendChild(li);
	}

    // Дни следующего месяца
    for (let i = 1; i <= trailingNext; i++) {
		const li = document.createElement('li');
		li.className = 'calendar__day calendar__day--inactive';

		const span = document.createElement('span');
		span.classList.add('calendar__day-nr');
		span.textContent = i;
		li.appendChild(span);

		const nextMonth = month === 11 ? 0 : month + 1;
		const nextYear = month === 11 ? year + 1 : year;
		li.dataset.date = this.#iso(nextYear, nextMonth, i);
		this.gridEl.appendChild(li);
	}

    this.updateSelection();
  }

  attachEvents() {
	this.gridEl.addEventListener('click', (e) => {
		const li = e.target.closest('.calendar__day');
		if (!li || !li.dataset.date) return;

		const date = li.dataset.date;

		// Если клик по одному выбранному дню (single) — снимаем выделение
		if (this.startDay && !this.endDay && this.startDay === date) {
		this.startDay = null;
		this.endDay = null;
		} 
		// Если клик по началу интервала — переносим начало на конец
		else if (this.startDay && this.endDay && this.startDay === date) {
		this.startDay = this.endDay;
		this.endDay = null;
		} 
		// Если клик по концу интервала — снимаем конец
		else if (this.endDay === date) {
		this.endDay = null;
		} 
		// Новый интервал
		else if (!this.startDay || (this.startDay && this.endDay)) {
		this.startDay = date;
		this.endDay = null;
		} 
		// Второй клик для формирования интервала
		else if (this.startDay && !this.endDay) {
		if (date >= this.startDay) {
			this.endDay = date;
		} else {
			this.endDay = this.startDay;
			this.startDay = date;
		}
		}

		this.updateSelection();
	});
	}

	updateSelection() {
		const days = this.gridEl.querySelectorAll('.calendar__day');
		days.forEach((li) => {
			const d = li.dataset.date;

			li.classList.remove(
				'calendar__day--selected',
				'calendar__day--start',
				'calendar__day--end',
				'calendar__day--single'
			);

			if (this.startDay && this.endDay) {
				if (d >= this.startDay && d <= this.endDay) li.classList.add('calendar__day--selected');
				if (d === this.startDay) li.classList.add('calendar__day--start');
				if (d === this.endDay) li.classList.add('calendar__day--end');
			} else if (this.startDay && !this.endDay) {
				if (d === this.startDay) li.classList.add('calendar__day--single');
			}
		});
	}

  #daysInMonth(year, month0) {
    return new Date(year, month0 + 1, 0).getDate();
  }

  #dowMonday0(date) {
    return (date.getDay() + 6) % 7;
  }

  #iso(year, month0, day) {
    return new Date(year, month0, day).toISOString().slice(0, 10);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MonthCalendar(document.querySelector('.calendar'));
});