abstract class SutoriScreen {
	Owner: SutoriGame;
	ScreenKey: SutoriScreenKey;
	HtmlView: string;


	constructor(owner: SutoriGame, key: SutoriScreenKey, htmlView: string) {
		this.Owner = owner;
		this.ScreenKey = key;
		this.HtmlView = htmlView;
	}


	abstract OnShown();
	abstract OnHide();


	protected async LoadView() {
		const target = document.querySelector(this.Owner.TargetSelector);
		if (!(target instanceof HTMLElement)) {
			throw new URIError('Invalid target selector');
		}
		
		const response = await fetch('views/'+this.HtmlView);
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