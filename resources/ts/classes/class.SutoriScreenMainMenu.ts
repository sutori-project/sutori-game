class SutoriScreenMainMenu extends SutoriScreen {
	constructor(owner :SutoriGame) {
		super(owner, SutoriScreenKey.MainMenu, 'main_menu.html');
	}


	OnShown() {
		this.LoadView();
	}

	
	OnHide() {
		// do something.
	}
}