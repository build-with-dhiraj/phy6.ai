# Gallery backdrop — designer QA scroll tests

Test on **localhost** with motion enabled (not “Reduce motion”). Hard refresh before each pass (`Cmd+Shift+R`). Use **Chrome or Safari** at desktop width (≥1024px) and repeat key cases at mobile width (≤768px).

Reference images (gallery backdrop only — not hero/manifesto plates):

| Fold | File | Visual cue |
|------|------|------------|
| 1 | `leonhard-niederwimmer.jpg` | Baroque nave, golden altar |
| 2 | `marc-olivier-jodoin.jpg` | Neo-Gothic, **cerulean** vaulted ceiling |
| 3 | `alexandr-istomin.jpg` | **Golden dome**, arches |
| 5 | `emmanuel-cassar.jpg` | Galleria glass **dome**, fresco |

Counter in bottom-left of backdrop: `01/04` … `04/04`.

---

## Stitch rule (hero, manifesto, footer)

Same logic for every fold transition:

1. **Rise:** Hold the current gallery image until the content fold’s **top** reaches the viewport top.
2. **Pinned / on screen:** Keep holding while the fold’s **bottom** is still at or below the viewport bottom margin (`bottom ≥ viewport height`).
3. **Stitch:** The **next** gallery image **starts** when the fold’s **bottom edge passes the viewport bottom margin** (crosses above the bottom of the screen). **Not** when the fold is fully off screen.
4. **Crossfade:** Fast blend over the next ~one viewport of scroll; previous image should not linger after the bottom has crossed.

| Transition | Content fold | Hold | Next image starts when |
|------------|--------------|------|-------------------------|
| 1 → 2 | Hero | Fold 1 (leonhard) | Hero **bottom** passes viewport bottom |
| 2 → 3 | Manifesto | Fold 2 (marc) | Manifesto **bottom** passes viewport bottom |
| 3 → 5 | Email + footer | Fold 3 (alexandr) | Late-fold **bottom** passes viewport bottom |

---

## TC-01 — Open / pre-hero

1. Load page at scroll top.
2. **Expect:** Fold 1 (leonhard). Counter `01/04`.
3. **Fail:** Any other cathedral image visible above rising content.

---

## TC-02 — Hero rise (hold fold 1)

1. Scroll slowly until hero enters from bottom.
2. **Expect:** Fold 1 until hero **top** reaches viewport top.
3. **Fail:** Fold 2 (blue ceiling) peeking above hero while hero is still rising.

---

## TC-03 — Hero → fold 2 stitch

1. Hero **top** at viewport top (hero pinned).
2. Scroll until hero **bottom edge passes the viewport bottom margin**.
3. **Expect:** Fold 2 **starts** at that moment (not when hero is fully off screen). Fast crossfade; counter reaches `02/04` over ~one viewport of scroll.
4. **Fail:** Fold 2 before bottom crosses viewport bottom; fold 1 dominant after bottom crossed; fold 2 only after hero entirely off screen.

---

## TC-04 — Manifesto rise (hold fold 2)

1. Scroll until manifesto enters from bottom.
2. **Expect:** Fold 2 (marc) in gap above manifesto; no fold 3 (golden dome) while manifesto is still rising.
3. **Fail:** Golden dome visible above rising manifesto.

---

## TC-05 — Manifesto body (hold fold 2)

1. Scroll through manifesto while it covers the viewport (top at or past viewport top).
2. **Expect:** Fold 2 while manifesto **bottom** is still at or below the viewport bottom margin.
3. **Fail:** Golden dome before manifesto bottom has crossed the viewport bottom edge.

---

## TC-06 — Manifesto → fold 3 stitch

1. Manifesto **top** at viewport top.
2. Scroll until manifesto **bottom edge passes the viewport bottom margin**.
3. **Expect:** Fold 3 (golden dome) **starts** at that moment (not when manifesto is fully off screen). Fast crossfade; counter reaches `03/04` over ~one viewport of scroll.
4. **Fail:** Golden dome before bottom crosses viewport bottom; fold 2 dominant after bottom crossed; fold 3 only after manifesto entirely off screen.

---

## TC-07 — Late fold rise (hold fold 3)

1. Scroll until email + footer block enters from bottom.
2. **Expect:** Fold 3 (golden dome) in gap above rising content; no emmanuel (glass dome) while block is still rising.
3. **Fail:** Emmanuel visible above rising email/footer.

---

## TC-08 — Late fold body (hold fold 3)

1. Scroll through email and footer while the block covers the viewport (top at or past viewport top).
2. **Expect:** Fold 3 while late-fold **bottom** is still at or below the viewport bottom margin.
3. **Fail:** Emmanuel before late-fold bottom has crossed the viewport bottom edge.

---

## TC-09 — Late fold → emmanuel stitch

1. Late-fold (email + footer) **top** at viewport top.
2. Scroll until late-fold **bottom edge passes the viewport bottom margin**.
3. **Expect:** Emmanuel **starts** at that moment (not when email/footer is fully off screen). Fast crossfade; counter reaches `04/04` over ~one viewport of scroll.
4. **Fail:** Emmanuel before bottom crosses viewport bottom; golden dome dominant after bottom crossed; emmanuel only after block entirely off screen.

---

## TC-10 — Page end

1. Scroll to absolute bottom.
2. **Expect:** Emmanuel holds; no blank or wrong frame; pin releases cleanly.
3. **Fail:** Counter stuck on `03/04` or image reverts.

---

## TC-11 — Crossfade speed

1. Repeat TC-03, TC-06, TC-09 at moderate scroll speed.
2. **Expect:** Snappy transitions (~one viewport height of scroll), not a long dissolve or hard snap.
3. **Fail:** Multi-second fade or abrupt cut with no blend.

---

## TC-12 — Reduce motion

1. Enable **Reduce motion** in OS settings; reload.
2. **Expect:** No pinned gallery; static grid section at bottom with all four images.
3. **Fail:** Scroll-linked backdrop still active.

---

## Regression notes

- Hero and manifesto **plate** images (InkedPlate) are separate from gallery folds.
- Gallery spacers add scroll length; gates follow **fold bottom geometry**, not spacer height alone.
