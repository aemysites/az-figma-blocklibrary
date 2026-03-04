/**
 * Chip Group block - renders a collection of selectable filter chips.
 * Each row in the block table represents one chip.
 * Bold text (**strong**) marks a chip as pre-selected/active.
 * Chips can be toggled active/inactive on click.
 * @param {Element} block The chip-group block element
 */
export default function decorate(block) {
  const items = [...block.children];
  const chipRow = document.createElement('div');
  chipRow.className = 'chip-group-row';

  items.forEach((item) => {
    const cell = item.querySelector('div');
    if (!cell) return;

    const text = cell.textContent.trim();
    if (!text) return;

    const isPreSelected = !!cell.querySelector('strong');

    const chip = document.createElement('button');
    chip.className = 'chip-group-chip';
    chip.setAttribute('type', 'button');

    const label = document.createElement('span');
    label.className = 'chip-group-label';
    label.textContent = text;
    chip.append(label);

    if (isPreSelected) {
      chip.classList.add('chip-group-chip-active');
      chip.setAttribute('aria-pressed', 'true');
      const closeBtn = document.createElement('span');
      closeBtn.className = 'chip-group-close';
      closeBtn.setAttribute('aria-hidden', 'true');
      closeBtn.textContent = '\u00D7';
      chip.append(closeBtn);
    } else {
      chip.setAttribute('aria-pressed', 'false');
    }

    chip.addEventListener('click', () => {
      const isActive = chip.classList.contains('chip-group-chip-active');
      if (isActive) {
        chip.classList.remove('chip-group-chip-active');
        chip.setAttribute('aria-pressed', 'false');
        const closeBtn = chip.querySelector('.chip-group-close');
        if (closeBtn) closeBtn.remove();
      } else {
        chip.classList.add('chip-group-chip-active');
        chip.setAttribute('aria-pressed', 'true');
        const closeBtn = document.createElement('span');
        closeBtn.className = 'chip-group-close';
        closeBtn.setAttribute('aria-hidden', 'true');
        closeBtn.textContent = '\u00D7';
        chip.append(closeBtn);
      }
    });

    chipRow.append(chip);
  });

  block.textContent = '';
  block.append(chipRow);
}
