/**
 * Chip Group block - renders a collection of selectable filter chips.
 * Each row in the block table represents one chip.
 * Bold text (**strong**) marks a chip as pre-selected/active.
 * Chips toggle active/inactive on click and filter a sibling article list.
 *
 * Article list items use text after the link as comma-separated tags:
 *   <li><a href="...">Title</a> Tag1, Tag2</li>
 * Tags are hidden visually and used for filtering.
 *
 * @param {Element} block The chip-group block element
 */
export default function decorate(block) {
  const items = [...block.children];
  const chipRow = document.createElement('div');
  chipRow.className = 'chip-group-row';

  // Find the sibling article list in the same section
  const section = block.closest('.section');
  const articleList = section ? section.querySelector('ul') : null;
  const articleItems = articleList ? [...articleList.querySelectorAll('li')] : [];

  // Parse tags from each article list item and store as data attribute
  articleItems.forEach((li) => {
    const link = li.querySelector('a');
    if (!link) return;

    // Text after the link = comma-separated tags
    const fullText = li.textContent;
    const linkText = link.textContent;
    const tagText = fullText.slice(fullText.indexOf(linkText) + linkText.length).trim();

    if (tagText) {
      const tags = tagText.split(',').map((t) => t.trim().toLowerCase());
      li.dataset.tags = tags.join(',');

      // Remove the tag text from visible content, keep only the link
      li.textContent = '';
      li.append(link);
    }
  });

  function filterArticles() {
    const activeChips = block.querySelectorAll('.chip-group-chip-active');
    const activeLabels = [...activeChips].map(
      (c) => c.querySelector('.chip-group-label').textContent.trim().toLowerCase(),
    );

    articleItems.forEach((li) => {
      const tags = li.dataset.tags ? li.dataset.tags.split(',') : [];
      if (activeLabels.length === 0) {
        li.classList.remove('chip-group-hidden');
      } else {
        const matches = tags.some((tag) => activeLabels.includes(tag));
        li.classList.toggle('chip-group-hidden', !matches);
      }
    });
  }

  function toggleChip(chip) {
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
    filterArticles();
  }

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

    chip.addEventListener('click', () => toggleChip(chip));
    chipRow.append(chip);
  });

  block.textContent = '';
  block.append(chipRow);

  // Apply initial filter based on pre-selected chips
  filterArticles();
}
