# Netivo Scripts Changelog

## Version 1.5.3
- Fixed build css/js/block to build specific types. 

## Version 1.5.2
- Added compilation when starting develop

## Version 1.5.1
- Added linter for js files

## Version 1.5.0
- Added linter for scss files, as action and during develop

## Version 1.4.4
- Fixed css map creation problem in develop

## Version 1.4.3
- Added possibility to build js,css, or blocks separately

## Version 1.4.2 
- Removed Gutenberg from front javascript compilation

## Version 1.4.1
- Fixed error when no css files were included in block

## Version 1.4.0
- Changed way of developing gutenberg blocks
- Fix for javascript development, new entries don't need now to restart the job

## Version 1.3.3
- Fix for Gutenberg destination folder

## Version 1.3.2
- Fix for creating dist directory
- Fix for continuing after sass compiler error

## Version 1.3.1
- Fix for windows paths in glob.sync

## Version 1.3
- Getting rid of Gulp and process files with dart-sass and postcss

## Version 1.2.1
- Removed fonts compiler
- Fixed javascript entry point error

## Version 1.2
- Replacing node-sass with dart-sass
- Adding option to split resulting files by adding entries