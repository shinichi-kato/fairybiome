export const standbyFairy =
{
    "config": {
        "description": "「呼んだら来る」モード。メモリ中のbuddyに上書きして使用",
        "defaultPartOrder": ["standby"],
        "hubBehavior": {
            "availability": 0.2,
            "generosity": 0.7,
            "retention": 0.0
        }
    },
    "wordDict": {
        "{!NOT_FOUND}": [""],
        "{!HELLO}": [""],
        "{!BOT_JUST_BORN}": [""],
        "{!BOT_NAME_ME}": [""],
        "{!ACCEPT_BUDDY_FORMATION}": [""],
        "{!REJECT_BUDDY_FORMATION}": [""],
        "{!IGNORE_BUDDY_FORMATION}": [""],
        "{!BOT_IS_DYING}": [""],
        "{!BOT_WILL_SPLIT}": [""],
        "{!BOT_WILL_JOIN}": [""],
        "{!BOT_MEETS_YOUはbotのものを使用}": [""],
        "{!BOT_ACCEPT_SUMMONはbotのものを使用}": [""],
        "{!TELL_ME_WHAT_TO_SAY}": [""],
        "{!PARSE_USER_INPUT}": [""],
        "{!I_GOT_IT}": [""]
    },
    "parts": {
        "standby": {
            "type": "recaller",
            "behavior": {
                "availability": 0.3,
                "generosity": 0.7,
                "retention": 0
            },
            "dict": [
                {
                    "in": ["おーい", "{botName}？", "いるかーい", "返事してー"],
                    "out": ["{!BOT_ACCEPT_SUMMON}"]
                }
            ]
        }
    },
    "state": {
        "partOrder": ["standby"],
        "activeInHub": false
    }
};
