# Варіант підвищення чіткості фото — 17.11.2026

Користувач попросив зробити штору та гірлянду чіткішими. У наданому фото ці ділянки вже розмиті; CSS-розмиття банера відсутнє. Вихідний файл збережений без змін: `assets-originals/studio/studio-hero-supplied.png` (1672×941).

ImageGen створив окремий варіант `assets-originals/studio/studio-hero-clarity-ai-v1.png` (1672×941). Штора, дроти й окремі вогники візуально чіткіші. Це синтез деталей за допомогою AI, а не відновлення достовірної інформації з оригіналу й не збільшення реальної роздільної здатності.

Користувач після пояснення обмежень прямо попросив замінити фото на сайті. Варіант підключено до hero. AI змінив також дрібні деталі поза шторою; документи на стіні не звірені з оригіналами й не є підтвердженням кваліфікації.

Підготовлено JPEG quality 90: `studio-hero-clarity-v1-1672.jpg`, `studio-hero-clarity-v1-1280.jpg`, `studio-hero-clarity-v1-mobile-706.jpg`. Мобільний crop збережено: 706×941, x=650, y=0. Попередні JPEG перенесено в `assets-originals/studio/previous-public`; джерело й AI-майстер збережено. Стилі, анімації та залежності не змінені. Перевірки — у docs/progress.md.

## Промпт

```text
Use case: precise-object-edit, photographic detail restoration. Image 1 is the ONLY edit target: an actual massage treatment room photograph. Improve focused clarity specifically in the dark brown curtain and warm hanging fairy-light strands, especially the soft leftmost third of the curtain (roughly x=700 to 970 in this 1672-pixel-wide photograph). Resolve the smudged curtain folds and natural fine fabric texture; make individual tiny LED bulbs and thin wires more distinctly defined, while retaining a restrained realistic warm glow around the lights. Preserve the original number, pattern, spacing and exact placement of strands and bulbs. Keep the identical room, camera viewpoint, composition, wide 16:9 framing, beige-brown palette, exposure and warm mood. Do not add, remove, move or redesign anything. Leave the wooden walls and ceiling, towels, treatment table, floor, radiator, and especially the framed certificates on the far-right wall unchanged. Do not recreate, sharpen, rewrite or alter any certificate text or document. No people, no web-page text, no logos, no green annotation, no added objects, no artificial halos or crunchy oversharpening, no plastic fabric. Output only the complete edited photograph at the highest available landscape resolution, ideally 3072x1728 or larger, preserving its original aspect ratio. This is a localized clarity improvement, not a new rendering of the room. Return the saved local file path.
```
