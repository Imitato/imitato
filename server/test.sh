# curl --data "userId=001&gameId=001&round=1" --form "fileupload=@imitato.png" 0.0.0.0:3000/game/round/submit
curl --form "fileupload=@../imitato.png" "0.0.0.0:3000/game/round/submit"
