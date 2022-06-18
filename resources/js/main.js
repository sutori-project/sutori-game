document.addEventListener("DOMContentLoaded", async function() {

    if (typeof Neutralino !== 'undefined') {
        try {
            // initialize neutralino
            Neutralino.init();

            // handle window closing.
            Neutralino.events.on("windowClose", function() {
                Neutralino.app.exit();
            });

            // center the screen.
            const w_size = await Neutralino.window.getSize();
            const x = (window.screen.width / 2) - (w_size.width / 2);
            const y = (window.screen.height / 2) - (w_size.height / 2);
            Neutralino.window.move(x, y);
            webMode = false;
        }
        catch (error) {
            console.log('Error whilst loading neutralino', error);
        }
    }

    console.log('Neutralino Loaded');

    const game = globalThis.game = new SutoriGame(
        '#app',				// the target selector.
        800, 600,			// the game width/height.
        SutoriCulture.None,	// the culture.
        'assets/game.xml'   // the initial sutori script to load every game.
    );
    await game.Play();
});