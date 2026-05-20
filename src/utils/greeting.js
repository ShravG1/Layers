// Editorial header copy. Varies by hour band + day of week.

const BANDS = [
  { from: 0, to: 5,  options: ['Past midnight', 'Small hours', 'Still awake'] },
  { from: 5, to: 12, options: ['Morning, quietly', 'Early hours', 'Half-light'] },
  { from: 12, to: 17, options: ['Afternoon', 'Mid-afternoon', 'A pause'] },
  { from: 17, to: 21, options: ['Evening drawing in', 'Early evening', 'Dusk'] },
  { from: 21, to: 23, options: ['Late evening', 'After supper', 'Lamps on'] },
  { from: 23, to: 24, options: ['Past ten', 'Late night', 'The quiet hour'] },
];

const SUNDAY = ['Quiet Sunday', 'Sunday, late', 'End of the week'];

export function greetingFor(date = new Date()) {
  if (date.getDay() === 0 && date.getHours() >= 20) {
    return pick(SUNDAY, date);
  }
  const h = date.getHours();
  const band = BANDS.find(b => h >= b.from && h < b.to) || BANDS[BANDS.length - 1];
  return pick(band.options, date);
}

function pick(arr, date) {
  // Stable per-day choice — same copy through the night.
  const seed = date.getFullYear() * 397 + date.getMonth() * 31 + date.getDate();
  return arr[seed % arr.length];
}
