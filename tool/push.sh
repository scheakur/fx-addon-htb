#!/bin/bash

git checkout gh-pages
git add -A
git commit -m 'Update package by Travis CI'
[ $GH_TOKEN ] && git push --quiet https://$GH_TOKEN@github.com/scheakur/fx-addon-htb.git 2> /dev/null
