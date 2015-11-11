build-semantic: semantic/*
	cd semantic && `npm bin`/gulp build
dev: build-semantic
	`npm bin`/gulp dev
release: build-semantic
	`npm bin`/gulp release
