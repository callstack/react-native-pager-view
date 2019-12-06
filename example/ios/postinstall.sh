#!/bin/bash
dir=$(pwd)
vpDir="$dir/Pods/react-native-viewpager/"
localDir=$(cd ../../ios/ && pwd)
cp -a $localDir $vpDir
echo "copied files from $localDir to $vpDir"
