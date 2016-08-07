#!/bin/bash

name=$1
pageSize=$2
startAt=$3
stopAt=$4

echo Running $name loading, page size is $pageSize, start at $startAt stop at $stopAt

cursor=$startAt
while [ $cursor -lt $stopAt ]; do
	echo Loading from $cursor;

	node $name.js $pageSize $cursor $(( $cursor + $pageSize ))
	cursor=$(( $cursor + $pageSize ));
done
