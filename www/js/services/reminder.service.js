angular.module('reminderApp')
    .service('reminderService', function ($http) {
        let date_id = 0;
        let dates = [];
        let today = new Date();
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const temp = date.toDateString().slice(4, -5);
            let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            if (i == 0) {
                dates.push({ "id": i, "date": dateStr, "value": "Today" });
            } else if (i == 1) {
                dates.push({ "id": i, "date": dateStr, "value": "Tomorrow" });
            } else {
                dates.push({ "id": i, "date": dateStr, "value": temp });
            }
        }
        let reminderData = [];
        let pillNameList = [];
        return {
            getDateId: getDateId,
            setDateId: setDateId,
            getData: getData,
            setData: setData,
            getDates: getDates,
            setReminderData: setReminderData,
            getReminderData: getReminderData,
            setPillNameList: setPillNameList,
            getPillNameList: getPillNameList
        };
        function getDateId() {
            return date_id;
        }
        function setDateId(value) {
            date_id = value;
        }
        function getData() {
            return data;
        }
        function setData(value) {
            data = value;
        }
        function getDates() {
            return dates;
        }
        function getReminderData() {
            if (localStorage.getItem("reminderData")) {
                reminderData = JSON.parse(localStorage.getItem("reminderData"));
            }
            return reminderData;
        }
        function setReminderData(value) {
            reminderData = value;
            localStorage.setItem("reminderData", JSON.stringify(reminderData));
        }
        function setPillNameList(value) {
            pillNameList = value;
            localStorage.setItem("pillNameList", JSON.stringify(pillNameList));
        }
        function getPillNameList() {
            if (localStorage.getItem("pillNameList")) {
                pillNameList = JSON.parse(localStorage.getItem("pillNameList"));
            }
            return pillNameList;
        }
    });