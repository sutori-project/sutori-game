class SutoriScreenGame extends SutoriScreen {
	private screen: HTMLElement;
	private dialogText: HTMLElement;
	private optionsBox: HTMLElement;
	private optionsBoxInner: HTMLElement;
	private ended: boolean;

	Document: SutoriDocument;
	Engine: SutoriEngine;
	Culture: SutoriCulture;
	OnChallenge?: CallableFunction;


	constructor(owner :SutoriGame) {
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
			if (initScript.length == 0) throw new Error("Missing a script to run!");

			// load in a document.
			const doc = await SutoriDocument.LoadXmlFile(initScript);

			// create a server engine.
			self.Document = doc;
			// setup custom uri loader so that xml assets only come from asset folder.
			self.Document.CustomUriLoader = async(uri: string) => {
				const response = await fetch('assets/' + uri);
				return await response.text();
			};

			// load images marked for preload.
			self.Document.Resources.forEach(async (img : SutoriResourceImage) => {
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


	private async PreloadImage(url: string) :Promise<number> {
		return new Promise((resolve, reject) => {
			let img = new Image()
			img.onload = () => resolve(img.height)
			img.onerror = reject
			img.src = `assets/${url}`
		});
	}


	// handle what happens when the server challenges for a response.
	private ChallengeHandler(self: SutoriScreenGame) {
		self.Engine.HandleChallenge = function(event: SutoriChallengeEvent) {
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
			if (self.OnChallenge) self.OnChallenge(event);
		};
	}


	private HandleChallengeImages(event: SutoriChallengeEvent) {
		const self = this;

		event.Moment.GetMedia(this.Culture).forEach(imageElement => {

			switch (imageElement.For)
			{
				case 'background':
					const resID = imageElement.ResourceID;
					const res = self.Document.GetResourceByID(resID) as SutoriResourceImage;
					if (typeof res == 'undefined')
						throw console.error("Failed to load resource", resID);
					if (typeof res.Src == 'undefined' || res.Src == null)
						throw console.error(`Resource ${resID} has an invalid src value.`);
					self.screen.style.backgroundImage = 'url(assets/'+res.Src+')';
					break;
			}

			/* const img = document.createElement('img');
			img.src = imageElement.Src;
			dialogText.appendChild(img); */
		});
	}


	private async HandleChallengeText(event: SutoriChallengeEvent) {
		const self = this;
		const text = event.Moment.GetText(self.Culture);

		if (self.dialogText.classList.contains('is-hidden')) {
			self.dialogText.classList.remove('is-hidden');
		}

		var typewriter_ended = false;

		self.dialogText.parentElement.classList.remove('waiting-for-input');

		for (let i=0; i<text.length; i++) {
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


	private HandleChallengeOptions(event: SutoriChallengeEvent) {
		const self = this;
		// find options.
		const options = event.Moment.GetOptions(this.Culture);
		// handle what happens when there are no options.
		if (options.length == 0) {
			this.optionsBox.classList.remove('active');
			
			self.dialogText.parentElement.onclick = function() {
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
				btn.onclick = function() {
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