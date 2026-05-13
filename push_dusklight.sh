#!/bin/bash

cd "aur/$1" || exit

updpkgsums
makepkg --printsrcinfo > .SRCINFO

git add .
git commit -m "ci/cd release: v$2"
git push

rm -rf aurora dusklight pkg src