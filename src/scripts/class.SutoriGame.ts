declare var theGame: SutoriGame


class SutoriGame {
	private screenObjects: Map<SutoriScreenKey, SutoriScreen>;
	private screenKey: SutoriScreenKey;
	private screenObject: SutoriScreen;
	
	
	public readonly TargetSelector: string;
	public readonly Width: number;
	public readonly Height: number;
	public readonly Culture: SutoriCulture;
	public readonly Input: SutoriInputHandler;
	public readonly InitScript: string;
	

	public get CurrentScreenKey() :SutoriScreenKey { return this.screenKey; }
	public get CurrentScreenObject() :SutoriScreen { return this.screenObject; }
	public get Target() :HTMLElement { return document.querySelector(this.TargetSelector); }


	constructor(selector: string, width: number, height: number, culture: SutoriCulture, init_script: string) {
		// setup initial property values.
		this.TargetSelector = selector;
		this.Width = width;
		this.Height = height;
		this.Culture = culture;
		this.InitScript = init_script;
		this.Input = new SutoriInputHandler(this);
		this.screenObjects = new Map<SutoriScreenKey, SutoriScreen>();
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


	public GetScreenAs<T extends SutoriScreen>(key: SutoriScreenKey) { return this.screenObjects.get(key) as T; }


	GotoScreen(key: SutoriScreenKey) {
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


	public UpdateAppScale() {
		const sw = document.body.clientWidth;
		const gw = 784;
		let scale = 1;
		
		if (sw > (gw+20)) {
			scale = (sw / gw) * 0.7;
		}

		this.Target.style.transform = 'scale('+scale+')';
	}
}
