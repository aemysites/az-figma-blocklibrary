/**
 * Decorates the chip-group block.
 * Each row in the block table becomes a chip.
 * Bold text (<strong>) indicates an active/selected chip.
 * @param {Element} block The chip-group block element
 */
export default function decorate(block) {
  const chipContainer = document.createElement('div');
  chipContainer.className = 'chip-group-container';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    const chip = document.createElement('button');
    chip.className = 'chip-group-chip';
    chip.setAttribute('type', 'button');

    const isActive = cell.querySelector('strong');
    const text = cell.textContent.trim();

    if (isActive) {
      chip.classList.add('chip-group-chip-active');
      chip.setAttribute('aria-pressed', 'true');

      const label = document.createElement('span');
      label.className = 'chip-group-chip-label';
      label.textContent = text;

      const closeIcon = document.createElement('span');
      closeIcon.className = 'chip-group-chip-close';
      closeIcon.setAttribute('aria-label', `Remove ${text}`);
      closeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

      chip.append(label, closeIcon);
    } else {
      chip.setAttribute('aria-pressed', 'false');
      chip.textContent = text;
    }

    chipContainer.append(chip);
  });

  block.replaceChildren(chipContainer);
}
