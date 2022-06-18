class SutoriInputHandler {
	callbacks :Array<SutoriInputCallback>;
	private idIter :number;
	private owner: SutoriGame;


	constructor(owner: SutoriGame) {
		this.callbacks = new Array<SutoriInputCallback>();
		this.idIter = 0;
		this.owner = owner;
		this.InitHandlers();
	}


	private InitHandlers() {
		const self = this;
		const app = self.owner.Target;
		
		document.onkeyup = (ev: KeyboardEvent) => {
			console.log('keyup');
			self.FindCallbacks2(SutoriInputScope.Any, SutoriInputScope.AnyKey).forEach(callback => {
				callback.Callback();
			});
		}

		app.onmouseup = (ev: MouseEvent) => {
			if (ev.button == 0) {
				self.FindCallbacks(SutoriInputScope.Any).forEach(callback => {
					callback.Callback();
				});
			}
		}
	}


	private FindCallbacks(scope: SutoriInputScope): Array<SutoriInputCallback>	{
		return this.callbacks.filter(t => t.Scope == scope).sort(t => t.ID);
	}

	private FindCallbacks2(scope: SutoriInputScope, scope2: SutoriInputScope): Array<SutoriInputCallback>	{
		return this.callbacks.filter(t => t.Scope == scope || t.Scope == scope2).sort(t => t.ID);
	}


	/**
	 * code in screens can call this to trigger a callback based on scope. 
	 * @param callback The function to call.
	 * @returns An id that can be used to unset the callback later.
	 */
	AddCallback(scope: SutoriInputScope, callback: CallableFunction) : Number {
		this.idIter = this.idIter + 1;
		const id = this.idIter;
		this.callbacks.push(new SutoriInputCallback(scope, id, callback));
		return id;
	}


	/**
	 * Remove a callback by providing it's id.
	 * @param id 
	 */
	ClearCallback(id: Number) {
		const callbackIndex = this.callbacks.findIndex(t => t.ID == id);
		if (callbackIndex >= 0) {
			this.callbacks.splice(callbackIndex, 1);
		}
	}
}


class SutoriInputCallback {
	readonly Scope: SutoriInputScope;
	readonly ID: number;
	readonly Callback: CallableFunction;
	constructor(scope: SutoriInputScope, id: number, callback: CallableFunction) {
		this.Scope = scope;
		this.ID = id;
		this.Callback = callback;
	}
}


enum SutoriInputScope {
	Any,
	AnyKey
}