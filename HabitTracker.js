const token = //Slack Appのトークン
const channelId = //投稿したいチャンネルのチャンネルID

const Action_id = {
  none: "🥶 やってないです",
  little: "😓 ちょっとだけ",
  well: "😙 結構やった！",
  pretty: "😤 めっちゃやった！!"
}

const Action_value = {
  study: "朝の勉強ちゃんとやったんか？毎日コツコツな",
  stretch: "ストレッチしたんか？身体大事にな",
  training: "筋トレしたんか？いい身体作れよな"
}

function doPost(e) {
  const payload = JSON.parse(e["parameter"]["payload"])
  const action_id = payload["actions"][0]["action_id"]
  const action_value = payload["actions"][0]["value"]
  const message_ts = payload["message"]["ts"]

  deleteMessage(message_ts)
  postMessage(action_value, makeAnsweredAttachements(action_id))
  writeAnswerToSpreadSheet(action_id, action_value, message_ts)
}

function getToday(timestamp) {
  const today = new Date(timestamp * 1000)

  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const date = today.getDate()

  const day_arr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = day_arr[today.getDay()]

  return year + "/" + month + "/" + date + " " + day
}

function postMessage(text, attachments) {
  const url = "https://slack.com/api/chat.postMessage"

  const payload = {
    "token" : token,
    "channel" : channelId,
    "text" : text,
    "attachments" : JSON.stringify(attachments)
  }
  const params = {
    "method" : "post",
    "payload" : payload
  }
  
  UrlFetchApp.fetch(url, params)
}

function deleteMessage(timestamp) {
  const url = "https://slack.com/api/chat.delete"

  const payload = {
    "token": token,
    "channel": channelId,
    "ts": timestamp
  }
  const params = {
    "method" : "post",
    "payload" : payload
  }
  
  UrlFetchApp.fetch(url, params)
}

//この関数をコピペ・適宜編集して、それぞれトリガーを設定する
function postSlackbot_study() {
  const action_value = Action_value.study
  const attachments = makeButtonAttachments(action_value)
  
  postMessage(action_value, attachments)
}

function writeAnswerToSpreadSheet(action_id, action_value, timestamp) {
  const today = getToday(timestamp)

  const sheet_url = //スプレッドシートのURL
  const sheet_name = //対象のシート名
  const sheet = SpreadsheetApp.openByUrl(sheet_url).getSheetByName(sheet_name)

  const lastRow = sheet.getLastRow()
  const targetRange = sheet.getRange(1, 1, lastRow == 0 ? 1 : lastRow)
  targetRange.activate()
  const finder = targetRange.createTextFinder(today)
  const results = finder.findAll()

  if (results.length == 0) {
    sheet.insertRows(2, 1)
    sheet.getRange(2, 1).setValue(today)
  }

  switch(action_value) {
    case Action_value.study:
      sheet.getRange(2, 2).setValue(action_id)
      break
    case Action_value.stretch:
      sheet.getRange(2, 3).setValue(action_id)
      break
    case Action_value.training:
      sheet.getRange(2, 4).setValue(action_id)
      break
  }
}

function makeAnsweredAttachements(action_id) {
  const attachments = [
    {
      "color": "#c74c98",
	    "blocks": [
		    {
			    "type": "section",
					"text": {
						"type": "plain_text",
						"text": action_id,
						"emoji": true
					}
		    },
		    {
			    "type": "section",
					"text": {
				    "type": "mrkdwn",
				    "text": "<"Habit TrackerのNotion URL"|Habit Tracker>"
					}
		    }
	    ]
    }
  ]

  return attachments
}

function makeButtonAttachments(action_value) {
  const attachments = [
    {
      "color": "#00fa9a",
	    "blocks": [
		    {
		    	"type": "actions",
			    "elements": [
				    {
					    "type": "button",
					    "text": {
						    "type": "plain_text",
						    "text": Action_id.none,
						    "emoji": true
					    },
					    "value": action_value,
					    "action_id": Action_id.none
				    }
			    ]
		    },
	    	{
			    "type": "actions",
			    "elements": [
				    {
					    "type": "button",
					    "text": {
					    	"type": "plain_text",
						    "text": Action_id.little,
						    "emoji": true
					    },
					    "value": action_value,
					    "action_id": Action_id.little
				    }
			    ]
		    },
		    {
			    "type": "actions",
			    "elements": [
			    	{
					    "type": "button",
					    "text": {
						    "type": "plain_text",
						    "text": Action_id.well,
						    "emoji": true
					    },
					    "value": action_value,
					    "action_id": Action_id.well
				    }
			    ]
		    },
		    {
			    "type": "actions",
			    "elements": [
			    	{
			    		"type": "button",
			    		"text": {
			    			"type": "plain_text",
			    			"text": Action_id.pretty,
			    			"emoji": true
			    		},
			    		"value": action_value,
			    		"action_id": Action_id.pretty
			    	}
		    	]
		    }
	    ]
    }
  ]
  
  return attachments
}