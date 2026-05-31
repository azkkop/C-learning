self.onmessage = function (event) {
    const { runnerBody, inputs } = event.data;

    class VirtualConsole {
        constructor(inputList) {
            this.inputs = inputList;
            this.inputIdx = 0;
            this.stdout = [];
        }
        ReadLine() {
            if (this.inputIdx < this.inputs.length) {
                return this.inputs[this.inputIdx++];
            }
            return '';
        }
        WriteLine(msg) {
            this.stdout.push(String(msg));
        }
        Write(msg) {
            if (this.stdout.length === 0) {
                this.stdout.push(String(msg));
            } else {
                this.stdout[this.stdout.length - 1] += String(msg);
            }
        }
        Clear() {
            this.stdout = [];
        }
    }

    try {
        const vConsole = new VirtualConsole(inputs);
        const programRunner = new Function('Console', runnerBody);
        programRunner(vConsole);
        self.postMessage({ ok: true, stdout: vConsole.stdout });
    } catch (err) {
        self.postMessage({
            ok: false,
            error: err.message,
            stack: err.stack || ''
        });
    }
};
