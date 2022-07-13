const fs = require('fs');
const process = require('process');

function log(str) {
    fs.writeSync(process.stdout.fd, str + "\n");
}

module.exports = exports = class {
    #testLineNumber = 0;

    #testLine(ok, description, annotation) {
        this.#testLineNumber++;
        log(`${ok ? "ok" : "not ok"} ${this.#testLineNumber} - ${description}${annotation}`);
    }

    #debugFailure(failure) {
        log(`  # ${failure.message}`);
        if (failure.stack) {
            log("  # === STACK TRACE ===");
            log(failure.stack.replace(/^/mg, "  # "));
            log("  # === END STACK TRACE ===");
        }
    }

    #skipAnnotation(status) {
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
        this.#testLine(spec.status !== "failed", spec.fullName, this.#skipAnnotation(spec.status));
        for (const failure of spec.failedExpectations) {
            this.#debugFailure(failure);
        }
    }

    suiteDone(suite) {
        this.#testLine(suite.status !== "failed", `${suite.fullName} passes suite-level expectations`, this.#skipAnnotation(suite.status));
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
