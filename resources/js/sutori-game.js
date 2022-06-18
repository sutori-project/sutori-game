class SutoriGame {
    constructor(selector, width, height, culture, init_script) {
        // setup initial property values.
        this.TargetSelector = selector;
        this.Width = width;
        this.Height = height;
        this.Culture = culture;
        this.InitScript = init_script;
        this.Input = new SutoriInputHandler(this);
        this.screenObjects = new Map();
        this.screenObjects.set(SutoriScreenKey.Splash, new SutoriScreenSplash(this));
        this.screenObjects.set(SutoriScreenKey.MainMenu, new SutoriScreenMainMenu(this));
        this.screenObjects.set(SutoriScreenKey.Game, new SutoriScreenGame(this));
        this.screenObjects.set(SutoriScreenKey.EndCredits, new SutoriScreenEndCredits(this));
        globalThis.theGame = this;
        // handle resizing of the app.
        window.onresize = () => this.UpdateAppScale();
        window.setInterval(() => this.UpdateAppScale(), 3000);
        this.UpdateAppScale();
    }
    get CurrentScreenKey() { return this.screenKey; }
    get CurrentScreenObject() { return this.screenObject; }
    get Target() { return document.querySelector(this.TargetSelector); }
    GetScreenAs(key) { return this.screenObjects.get(key); }
    GotoScreen(key) {
        if (!this.screenObjects.has(key)) {
            throw new RangeError("The key passed to GotoScreen is invalid.");
        }
        // let the previous screen know we are hiding it.
        if (this.screenObject) {
            this.screenObject.OnHide();
        }
        this.screenKey = key;
        this.screenObject = this.screenObjects.get(key);
        this.screenObject.OnShown();
    }
    async Play() {
        console.log("Play was called.");
        this.GotoScreen(SutoriScreenKey.Splash);
    }
    UpdateAppScale() {
        const sw = document.body.clientWidth;
        const gw = 784;
        let scale = 1;
        if (sw > (gw + 20)) {
            scale = (sw / gw) * 0.7;
        }
        this.Target.style.transform = 'scale(' + scale + ')';
    }
}
class SutoriInputHandler {
    constructor(owner) {
        this.callbacks = new Array();
        this.idIter = 0;
        this.owner = owner;
        this.InitHandlers();
    }
    InitHandlers() {
        const self = this;
        const app = self.owner.Target;
        document.onkeyup = (ev) => {
            console.log('keyup');
            self.FindCallbacks2(SutoriInputScope.Any, SutoriInputScope.AnyKey).forEach(callback => {
                callback.Callback();
            });
        };
        app.onmouseup = (ev) => {
            if (ev.button == 0) {
                self.FindCallbacks(SutoriInputScope.Any).forEach(callback => {
                    callback.Callback();
                });
            }
        };
    }
    FindCallbacks(scope) {
        return this.callbacks.filter(t => t.Scope == scope).sort(t => t.ID);
    }
    FindCallbacks2(scope, scope2) {
        return this.callbacks.filter(t => t.Scope == scope || t.Scope == scope2).sort(t => t.ID);
    }
    /**
     * code in screens can call this to trigger a callback based on scope.
     * @param callback The function to call.
     * @returns An id that can be used to unset the callback later.
     */
    AddCallback(scope, callback) {
        this.idIter = this.idIter + 1;
        const id = this.idIter;
        this.callbacks.push(new SutoriInputCallback(scope, id, callback));
        return id;
    }
    /**
     * Remove a callback by providing it's id.
     * @param id
     */
    ClearCallback(id) {
        const callbackIndex = this.callbacks.findIndex(t => t.ID == id);
        if (callbackIndex >= 0) {
            this.callbacks.splice(callbackIndex, 1);
        }
    }
}
class SutoriInputCallback {
    constructor(scope, id, callback) {
        this.Scope = scope;
        this.ID = id;
        this.Callback = callback;
    }
}
var SutoriInputScope;
(function (SutoriInputScope) {
    SutoriInputScope[SutoriInputScope["Any"] = 0] = "Any";
    SutoriInputScope[SutoriInputScope["AnyKey"] = 1] = "AnyKey";
})(SutoriInputScope || (SutoriInputScope = {}));
class SutoriScreen {
    constructor(owner, key, htmlView) {
        this.Owner = owner;
        this.ScreenKey = key;
        this.HtmlView = htmlView;
    }
    async LoadView() {
        const target = document.querySelector(this.Owner.TargetSelector);
        if (!(target instanceof HTMLElement)) {
            throw new URIError('Invalid target selector');
        }
        const response = await fetch('views/' + this.HtmlView);
        if (!response.ok) {
            return Promise.reject(response);
        }
        // inject the view html.
        target.innerHTML = await response.text();
        // allow js in injected html to execute.
        var arr = target.getElementsByTagName('script');
        for (var n = 0; n < arr.length; n++) {
            eval(arr[n].innerHTML);
        }
    }
}
class SutoriScreenGame extends SutoriScreen {
    constructor(owner) {
        super(owner, SutoriScreenKey.Game, 'game.html');
        this.Engine = null;
        // record which culture we wish to use when displaying multimedia. 
        this.Culture = owner.Culture;
    }
    async OnShown() {
        const self = this;
        await self.LoadView();
        self.ended = false;
        self.screen = document.querySelector('.screen-game');
        self.dialogText = document.querySelector('.dialog-text div');
        self.optionsBox = document.querySelector('.options-box');
        self.optionsBoxInner = document.querySelector('.options-box > div');
        if (self.Engine == null) {
            // get the list of xml files to load.
            const initScript = self.Owner.InitScript;
            // make sure we have scripts to run.
            if (initScript.length == 0)
                throw new Error("Missing a script to run!");
            // load in a document.
            const doc = await SutoriDocument.LoadXml(initScript);
            // create a server engine.
            self.Document = doc;
            // setup custom uri loader so that xml assets only come from asset folder.
            self.Document.CustomUriLoader = async (uri) => {
                const response = await fetch('assets/' + uri);
                return await response.text();
            };
            // load images marked for preload.
            self.Document.Resources.forEach(async (img) => {
                return await self.PreloadImage(img.Src);
            });
            // init the engine/handler.
            self.Engine = new SutoriEngine(doc);
            self.ChallengeHandler(self);
            // remove loading indicator.
            self.screen.classList.remove('is-loading');
            // add a tiny bit of delay.
            setTimeout(() => {
                // begin the game!
                self.Engine.Play();
            }, 1000);
        }
    }
    async PreloadImage(url) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve(img.height);
            img.onerror = reject;
            img.src = `assets/${url}`;
        });
    }
    // handle what happens when the server challenges for a response.
    ChallengeHandler(self) {
        self.Engine.HandleChallenge = function (event) {
            // deal with clearing the various elements.
            if (event.Moment.Clear === true) {
                self.dialogText.innerHTML = '';
                self.dialogText.classList.add('is-hidden');
                console.log('Cleared Screen');
            }
            else
                self.dialogText.querySelectorAll('button').forEach(b => b.remove());
            // handle the various media.
            self.HandleChallengeImages(event);
            self.HandleChallengeText(event);
            //self.HandleChallengeOptions(event);
            // if user wanted to trigger a callback on moment event.
            if (self.OnChallenge)
                self.OnChallenge(event);
        };
    }
    HandleChallengeImages(event) {
        const self = this;
        event.Moment.GetImages(this.Culture).forEach(imageElement => {
            switch (imageElement.For) {
                case 'background':
                    const resID = imageElement.ResourceID;
                    const res = self.Document.GetResourceByID(resID);
                    if (typeof res == 'undefined')
                        throw console.error("Failed to load resource", resID);
                    if (typeof res.Src == 'undefined' || res.Src == null)
                        throw console.error(`Resource ${resID} has an invalid src value.`);
                    self.screen.style.backgroundImage = 'url(assets/' + res.Src + ')';
                    break;
            }
            /* const img = document.createElement('img');
            img.src = imageElement.Src;
            dialogText.appendChild(img); */
        });
    }
    async HandleChallengeText(event) {
        const self = this;
        const text = event.Moment.GetText(self.Culture);
        if (self.dialogText.classList.contains('is-hidden')) {
            self.dialogText.classList.remove('is-hidden');
        }
        var typewriter_ended = false;
        self.dialogText.parentElement.classList.remove('waiting-for-input');
        for (let i = 0; i < text.length; i++) {
            // wait 500ms
            await new Promise(resolve => setTimeout(resolve, 50));
            self.dialogText.textContent += text[i];
        }
        self.dialogText.innerHTML += "\n<br />";
        /* texts.forEach(textElement => {
            const p = document.createElement('p');
            p.textContent = textElement.Text;
            this.dialogText.appendChild(p);
        }); */
        self.HandleChallengeOptions(event);
    }
    HandleChallengeOptions(event) {
        const self = this;
        // find options.
        const options = event.Moment.GetOptions(this.Culture);
        // handle what happens when there are no options.
        if (options.length == 0) {
            this.optionsBox.classList.remove('active');
            self.dialogText.parentElement.onclick = function () {
                self.dialogText.parentElement.onclick = null;
                if (self.ended == true) {
                    /* goto the main menu if the game has ended */
                    self.Owner.GotoScreen(SutoriScreenKey.MainMenu);
                    return;
                }
                if (self.Engine.GotoNextMoment() === false) {
                    self.ended = true;
                }
            };
            self.dialogText.parentElement.classList.add('waiting-for-input');
        }
        else {
            this.optionsBox.classList.add('active');
            this.optionsBoxInner.innerHTML = '';
            options.forEach(optionElement => {
                const btn = document.createElement('button');
                btn.textContent = optionElement.Text;
                btn.onclick = function () {
                    self.optionsBox.classList.remove('active');
                    self.dialogText.parentElement.onclick = null;
                    self.Engine.GotoMomentID(optionElement.Target);
                };
                this.optionsBoxInner.appendChild(btn);
            });
        }
    }
    OnHide() {
        // dispose various callbacks.
        if (this.OnChallenge !== null) {
            this.OnChallenge = null;
        }
        this.Engine.HandleChallenge = null;
        this.Engine = null;
    }
}
class SutoriScreenMainMenu extends SutoriScreen {
    constructor(owner) {
        super(owner, SutoriScreenKey.MainMenu, 'main_menu.html');
    }
    OnShown() {
        this.LoadView();
    }
    OnHide() {
        // do something.
    }
}
class SutoriScreenSplash extends SutoriScreen {
    constructor(owner) {
        super(owner, SutoriScreenKey.Splash, 'splash.html');
    }
    OnShown() {
        const self = this;
        self.LoadView();
        self.cid = self.Owner.Input.AddCallback(SutoriInputScope.Any, function () {
            self.Owner.Input.ClearCallback(self.cid);
            self.Owner.GotoScreen(SutoriScreenKey.MainMenu);
        });
    }
    OnHide() {
        // do something.
    }
}
class SutoriScreenEndCredits extends SutoriScreen {
    constructor(owner) {
        super(owner, SutoriScreenKey.Splash, 'end_credits.html');
    }
    OnShown() {
        this.LoadView();
    }
    OnHide() {
        // do something.
    }
}
var SutoriScreenKey;
(function (SutoriScreenKey) {
    SutoriScreenKey[SutoriScreenKey["Splash"] = 0] = "Splash";
    SutoriScreenKey[SutoriScreenKey["MainMenu"] = 1] = "MainMenu";
    SutoriScreenKey[SutoriScreenKey["Game"] = 2] = "Game";
    SutoriScreenKey[SutoriScreenKey["EndCredits"] = 3] = "EndCredits";
})(SutoriScreenKey || (SutoriScreenKey = {}));
//# sourceMappingURL=sutori-game.js.map