# PasteARef

### What is it in brief? 
A website hosting an enhanced Sketchfab 3D model viewer based on the Sketchfab Viewer API. It features customized controls and tools dedicated to visual artists using the site for reference or artistic studies—like perspective grids, FOV control, frame-by-frame animation control, and lighting customization.

### Why?
[Sketchfab](https://sketchfab.com/) is a fantastic resource in and of itself when it comes to studying how things look from every possible angle. Whether you need to see [how a sports car looks from really close](https://sketchfab.com/3d-models/lancia-delta-321e4bf61b3c45c2935b4e37a088d45f) or you need to figure out the right angle to draw a [castle](https://sketchfab.com/3d-models/rocca-calascio-rawscan-7fbfe67ec4864d439f25303b50697189) from in your upcoming fantasy comic, Sketchfab's immense model library has you covered. 

HOWEVER, being a 3D-artist-centric viewer, I always thought that, despite being immensely useful for 2D artists as well, it lacked specific features found in other popular reference/animation/study viewers like [Posemaniacs](https://www.posemaniacs.com). Then I found out that the public Sketchfab Viewer API actually makes it possible to control the nitty-gritty code of the viewer itself for other sites to host and personalize it. So that's what this personal project is about: making it more useful for 2D artists for reference and study purposes.

### What's the difference?
Visit the Sketchfab site and copy-paste the URL or UID for the **SPECIFIC MODEL** that you want to study. Then you will be able to:

*   **Add perspective grids** tied to the 3D model in all three directions. This is especially useful when studying perspective applied to characters and anatomy to make them really feel like they belong to the surrounding environments!
*   **Change the viewing angle (FOV)** from a full 180° to 1°. This allows the scene to shift from how it would look through a wide-angle lens to basically an orthographic view with vanishing points at infinity. You want to practice drawing [distorted, hyper-dynamic characters](https://www.crunchyroll.com/news/latest/2020/5/20/triggers-director-hiroyuki-imaishi-unleashes-anime-art-book)? Crank up that number! Want to draw an isometric, cozy-feeling scene? Then go small.
*   **More grids!** Grids help to nail down proportions, especially for beginner artists. Rectangular (square, actually...) grids can be superimposed in any number over the viewport. More composition guides (Rule of Thirds, Golden Ratio) are also available. 
*   **Animation Layouts:** For studying animation layout, a Japanese-style 16:9 animation template is available. Also, letterboxing in many options can be toggled on to have a better sense of the final composition.
*   **Animation Control:** Want to study how to draw a [walk cycle](https://sketchfab.com/3d-models/generic-walking-818e2632369643e887b2b7706f7613c2) or a zombie-style run? The vanilla Sketchfab Viewer has no options to advance animations frame-by-frame. In PasteARef, you can advance and recede 1 or 2 frames at a time (assuming 24 fps playback).
*   **Sketching & Notes:** Take sketches and notes over the model with an essential drawing canvas. It supports Undo with `Ctrl+Z` and the possibility to add small snippets of text to the viewport.
*   **Control the Lights:** Lights are embedded in the original 3D model by their creator. While no new lights can be added, those that are there can be customized. Change the intensity and color of any of the up-to-three different lights supported by the Sketchfab model engine. See their [site](https://sketchfab.com/blogs/community/how-to-fine-tune-your-lighting-and-shadows-on-sketchfab/) for more details. 
    *   *WARNING: The main lighting source for many models comes from general environmental illumination. Controls to customize this light ARE YET TO BE IMPLEMENTED.*

### Future Updates?
Maybe?...
