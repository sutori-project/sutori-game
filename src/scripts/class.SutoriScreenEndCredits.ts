class SutoriScreenEndCredits extends SutoriScreen {
	constructor(owner :SutoriGame) {
		super(owner, SutoriScreenKey.Splash, 'end_credits.html');
	}


	OnShown() {
		this.LoadView();
	}

	
	OnHide() {
		// do something.
	}
}