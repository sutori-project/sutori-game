class SutoriScreenSplash extends SutoriScreen {
	private cid: Number;

	
	constructor(owner :SutoriGame) {
		super(owner, SutoriScreenKey.Splash, 'splash.html');
	}


	OnShown() {
		const self = this;
		self.LoadView();
		self.cid = self.Owner.Input.AddCallback(SutoriInputScope.Any, function() {
			self.Owner.Input.ClearCallback(self.cid);
			self.Owner.GotoScreen(SutoriScreenKey.MainMenu);
		});
	}

	
	OnHide() {
		// do something.
	}
}