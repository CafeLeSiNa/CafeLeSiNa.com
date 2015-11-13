dev:
	`npm bin`/gulp dev
release:
	`npm bin`/gulp release
	git add ./public
	git ci -m "Build"
	git subtree push --prefix public/ origin gh-pages
