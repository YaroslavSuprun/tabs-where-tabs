import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tabs-where-tabs" is now active!');

	const disposable = vscode.commands.registerCommand('tabs-where-tabs.fixFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }

		const document = editor.document;
		const tabSize = editor.options.tabSize as number || 4;

		// collecting all the addits I want to make
		const edits: vscode.TextEdit[] = [];

		for (let i = 0; i < document.lineCount; ++i) {
			const line = document.lineAt(i);
			const text = line.text;

			// find leading whitespaces
			const match = text.match(/^(\s+)/);
			if (!match) { continue; }

			const leadingWhitespace = match[1];
			
			// count how many "tab stops" worth of spaces are at the start
			// expand existing tabs to spaces first so we can count uniformly
			let spaceCount = 0;
			for (const ch of leadingWhitespace) {
				if (ch === '\t') {
					spaceCount += tabSize;
				} else {
					spaceCount++;
				}
			}

			// split into indentation (tabs) and alignment (spaces)
			const indentTabs = Math.floor(spaceCount / tabSize);
			const alignSpaces = spaceCount % tabSize;
			
			const newWhitespace = '\t'.repeat(indentTabs) + ' '.repeat(alignSpaces);

			// only edit if something actually changed
			if (leadingWhitespace !== newWhitespace) {
				const range = new vscode.Range(i, 0, i, leadingWhitespace.length);
				edits.push(vscode.TextEdit.replace(range, newWhitespace));
			}
		}
		
		// apply all edits at once
		const edit = new vscode.WorkspaceEdit();
		edit.set(document.uri, edits);
		vscode.workspace.applyEdit(edit);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
