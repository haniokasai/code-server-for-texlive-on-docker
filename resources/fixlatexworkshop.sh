#!/bin/bash

#Reference: https://github.com/cdr/code-server/issues/1828
#script based on https://gist.github.com/HannesGitH/bf70790accef0773821fd6b83b335292

#this should be the directory where all the extensions are installed
EXT="$HOME/.local/share/code-server/extensions"


cd /tmp

ls $EXT | awk -F- '/latex-workshop/ {print $NF}' | while read VER; do
  echo $VER
  
  #override $VER
  #VER="8.17.0"
  
  DIR="$EXT/james-yu.latex-workshop-$VER/"
  curl -fOL https://james-yu.gallery.vsassets.io/_apis/public/gallery/publisher/james-yu/extension/latex-workshop/$VER/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage
  unzip -o /tmp/Microsoft.VisualStudio.Services.VSIXPackage 'extension/out/*'
  cp -rf  /tmp/extension/out $DIR/
  # replace code to preview pdf
  cp -R /tmp/out/* $DIR/out/
  cp -R /tmp/extension/* $DIR/out/
done