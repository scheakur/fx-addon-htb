#!/bin/bash

git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis-ci"

git status
git branch -a
git fetch --all
git status
git branch -a

git checkout -b gh-pages remotes/origin/gh-pages
git status
git branch -a
git add -A
git commit -m 'Update package by Travis CI'
[ $GH_TOKEN ] && git push --quiet https://$GH_TOKEN@github.com/scheakur/fx-addon-htb.git gh-pages 2> /dev/null
