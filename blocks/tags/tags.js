/**
 * Tags block - renders a group of filterable chip/tag buttons.
 * Each row in the block table becomes a chip. Authors can mark
 * a chip as active by adding "(active)" after the label text.
 * @param {Element} block The tags block element
 */
export default function decorate(block) {
  const chips = [];
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    chips.push({ text, element: row });
  });

  block.textContent = '';

  const chipRow = document.createElement('div');
  chipRow.className = 'tags-chip-row';

  chips.forEach(({ text }) => {
    let label = text;
    const isActive = label.toLowerCase().includes('(active)');
    if (isActive) {
      label = label.replace(/\s*\(active\)\s*/i, '').trim();
    }

    const chip = document.createElement('button');
    chip.className = 'tags-chip';
    chip.setAttribute('type', 'button');
    if (isActive) {
      chip.classList.add('tags-chip-active');
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'tags-chip-label';
    labelSpan.textContent = label;
    chip.append(labelSpan);

    if (isActive) {
      const closeIcon = document.createElement('span');
      closeIcon.className = 'tags-chip-close';
      closeIcon.setAttribute('aria-label', `Remove ${label}`);
      closeIcon.innerHTML = '&#x2715;'; // × close symbol
      chip.append(closeIcon);
    }

    chip.addEventListener('click', () => {
      if (chip.classList.contains('tags-chip-active')) {
        chip.classList.remove('tags-chip-active');
        const close = chip.querySelector('.tags-chip-close');
        if (close) close.remove();
      } else {
        chip.classList.add('tags-chip-active');
        if (!chip.querySelector('.tags-chip-close')) {
          const closeIcon = document.createElement('span');
          closeIcon.className = 'tags-chip-close';
          closeIcon.setAttribute('aria-label', `Remove ${label}`);
          closeIcon.innerHTML = '&#x2715;';
          chip.append(closeIcon);
        }
      }
    });

    chipRow.append(chip);
  });

  block.append(chipRow);
}
