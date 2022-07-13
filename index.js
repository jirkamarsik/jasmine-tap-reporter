const fs = require('fs');
const process = require('process');

function log(str) {
    fs.writeSync(process.stdout.fd, str + "\n");
}

module.exports = exports = class {
    #testLineNumber = 0;

    #testLine(ok, description, directive) {
        this.#testLineNumber++;
        log(`${ok ? "ok" : "not ok"} ${this.#testLineNumber} - ${description}${directive}`);
    }

    #commentDiagnostics(diagnostics) {
        return diagnostics.replace(/^/mg, "  # ");
    }

    #debugFailure(failure) {
        log(this.#commentDiagnostics(failure.message));
        if (failure.stack) {
            log("  # === STACK TRACE ===");
            log(this.#commentDiagnostics(failure.stack));
            log("  # === END STACK TRACE ===");
        }
    }

    #directiveSkip(status) {
        if (status === "excluded" || status === "pending") {
            return ` # SKIP ${status}`;
        } else {
            return "";
        }
    }

    jasmineStarted(info) {
        this.#testLineNumber = 0;
    }

    specDone(spec) {
        this.#testLine(spec.status !== "failed", spec.fullName, this.#directiveSkip(spec.status));
        for (const failure of spec.failedExpectations) {
            this.#debugFailure(failure);
        }
    }

    suiteDone(suite) {
        this.#testLine(suite.status !== "failed", `${suite.fullName} passes suite-level expectations`, this.#directiveSkip(suite.status));
        for (const failure of suite.failedExpectations) {
            this.#debugFailure(failure);
        }
    }

    jasmineDone(info) {
        this.#testLine(info.failedExpectations.length === 0, "passes global-level expectations", "");
        for (const failure of info.failedExpectations) {
            this.#debugFailure(failure);
        }
        log(`1..${this.#testLineNumber}`);
    }
};
