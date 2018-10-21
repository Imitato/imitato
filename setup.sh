if command -v aws
then npm run config -- --account-id=$ACCOUNT_ID --bucket-name="imitato" && npm run setup && open https://console.aws.amazon.com/cloudformation/home
else
  echo "Please install aws-cli and run aws configure."
fi
