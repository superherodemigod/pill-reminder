/**
 *  This controller manages all stores information
 *
 *  @module ReminderController
 */


angular.module('reminderApp')
  .controller('ReminderController', function ($scope, $ionicPopup, $interval, reminderService, $cordovaLocalNotification) {

    let choices = reminderService.getPillNameList();
    let date_id = reminderService.getDateId();
    $scope.date_id = date_id;
    $scope.dates = reminderService.getDates();
    $scope.reminderData = reminderService.getReminderData();

    $scope.addNotification = function () {
      var alarmTime = new Date();
      alarmTime.setMinutes(alarmTime.getSeconds()+10);
      $cordovaLocalNotification.add({
        id: "1234",
        date: alarmTime,
        message: "This is a message",
        title: "This is a title",
        autoCancel: true,
        sound: null
      }).then(function () {
        console.log("The notification has been set");
      });
    };

    $scope.isScheduled = function () {
      $cordovaLocalNotification.isScheduled("1234").then(function (isScheduled) {
        alert("Notification 1234 Scheduled: " + isScheduled);
      });
    }

    $scope.showConfirm = function (id) {
      let reminder = $scope.reminderData[id].data;
      var confirmPopup = $ionicPopup.confirm({
        title: '<i class="icon ion-beaker"></i>' + reminder.pillName + " " + reminder.reminderTime,
        // template: 'Are you sure you want to eat this ice cream?',
        okText: 'Remove',
        okType: 'button-assertive',
        cancelText: 'Snooze',
        cancelType: 'button-assertive',
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('Remove');
          reminder.alertCount = 3;
        } else {
          reminder.alertCount = parseInt(reminder.alertCount) + 1;
          let temp = reminder.alertTime.split(":");
          let nextMin = 0;
          let nextHour = 0;

          if (parseInt(temp[1]) > 50) {
            nextMin = 60 - parseInt(temp[1]);
            if (parseInt(temp[0]) == 24) {
              nextHour = 2;
            } else {
              nextHour = parseInt(temp[0]) + 1;
            }
          } else {
            nextMin = parseInt(temp[1]) + 10;
            nextHour = temp[0];
          }
          if (nextMin < 10) {
            nextMin = "0" + nextMin;
          }
          // console.log(nextHour, nextMin);
          reminder.alertTime = nextHour + ":" + nextMin;
        }
      });
    };

    $interval(function () {
      let today = new Date();
      let currentHour = today.getHours();
      let currentMin = today.getMinutes();
      let todayDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      if (currentMin < 10) {
        currentMin = "0" + currentMin;
      }
      let currentTime = currentHour + ":" + currentMin;
      for (let i = 0; i < $scope.reminderData.length; i++) {
        const reminder = $scope.reminderData[i];
        if ((reminder.data.startDate == todayDate) && (reminder.data.alertTime == currentTime)) {
          if (parseInt(reminder.data.alertCount) < 3) {
            console.log(reminder.data.pillName);
            $scope.showConfirm(i);
            // $cordovaLocalNotification.add({
            //   id: reminder.data.id,
            //   date: reminder.data.alertTime,
            //   message: "This is a message",
            //   title: "This is a title",
            //   autoCancel: true,
            //   sound: null
            // }).then(function () {
            //   console.log("The notification has been set");
            // });
          }
        }
      }
      console.log(currentTime);
    }, 60000);

    $scope.setActive = function (id) {
      $scope.date_id = id;
      reminderService.setDateId($scope.date_id);
      $scope.showOneDayData(id);
    };
    $scope.addReminder = function () {
      // console.log(window.location.href);
      let pillName = document.getElementById("pillName").value;
      let frequency = document.getElementById("frequency").value;
      let startDate = document.getElementById("startDate").innerHTML.trim();
      let endDate = document.getElementById("endDate").innerHTML.trim();
      let reminderTime = document.getElementById("reminderTime").innerHTML.trim();
      let reminderSound = document.getElementById("reminderSound").value;
      let reminder = {
        "pillName": pillName,
        "frequency": frequency,
        "startDate": startDate,
        "endDate": endDate,
        "reminderTime": reminderTime,
        "alertTime": reminderTime,
        "alertCount": 0,
        "reminderSound": reminderSound
      }

      let urlParams = window.location.href.split("/");
      let reminder_id = urlParams[5];
      if (reminder_id) {
        let index = $scope.reminderData.findIndex(item => item.id == reminder_id);
        $scope.reminderData[index].data = reminder;
        console.log($scope.reminderData[index]);
      }
      else {
        let index = $scope.reminderData.length + 1;
        let date = $scope.dates[date_id].date;
        $scope.reminderData.push({ "id": index, "date": date, "data": reminder });
      }
      let count = 0;
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (reminder.pillName == choice.label) {
          count = count + 1;
        }
      }
      if (count == 0) {
        let index = choices.length;
        choices.push({ "id": index + 1, "label": reminder.pillName });
        reminderService.setPillNameList(choices);
      }
      reminderService.setReminderData($scope.reminderData);
      $scope.showOneDayData(date_id);
      window.location = "/";
    }

    $scope.editReminder = function (id) {
      $reminder = $scope.reminderData.find(item => item.id == id);
      $scope.pillName = $reminder.data.pillName;
      $scope.frequency = $reminder.data.frequency;
      $scope.startDate = $reminder.data.startDate;
      $scope.endDate = $reminder.data.endDate;
      $scope.reminderTime = $reminder.data.reminderTime;
      $scope.reminderSound = $reminder.data.reminderSound;
    }
    $scope.showOneDayData = function (date_id) {
      $scope.showData = [];
      let reminderData = reminderService.getReminderData();
      if (reminderData.length > 0) {
        for (let i = 0; i < reminderData.length; i++) {
          let temp = reminderData[i];
          // console.log(temp.date, $scope.dates);
          if ($scope.dates[date_id].date == temp.date && !temp.data.deleted) {
            $scope.showData.push(temp);
          }
        }
      }
    }
    let urlParams = window.location.href.split("/");
    let reminder_id = urlParams[5];
    if (reminder_id) {
      $scope.editReminder(reminder_id);
    }
    $scope.deleteReminder = function () {
      let urlParams = window.location.href.split("/");
      let reminder_id = urlParams[5];
      if (reminder_id) {
        console.log("delete");
        let index = $scope.reminderData.findIndex(item => item.id == reminder_id);
        $scope.reminderData[index].data.deleted = 'true';
        console.log($scope.reminderData[index]);
        reminderService.setReminderData($scope.reminderData);
        $scope.showOneDayData(date_id);
      }
      window.location = "/";
    }
    initController();
    function initController() {
      $scope.showOneDayData(date_id);
    }

    //////////////////////////////


    $scope.items = choices;
    $scope.minlength = 1;
    $scope.selected = {};
    $scope.filteredChoices = [];
    $scope.isVisible = {
      suggestions: false
    };


    $scope.filterItems = function () {
      $scope.pillName = document.getElementById("pillName").value;
      // console.log($scope.pillName);
      if ($scope.minlength <= $scope.pillName.length) {
        $scope.filteredChoices = querySearch($scope.pillName);
        $scope.isVisible.suggestions = $scope.filteredChoices.length > 0 ? true : false;
      }
      else {
        $scope.isVisible.suggestions = false;
      }
    };


    /**
     * Takes one based index to save selected choice object
     */
    $scope.selectItem = function (index) {
      $scope.selected = $scope.items[index - 1];
      document.getElementById("pillName").value = $scope.selected.label;
      $scope.pillName = $scope.selected.label;
      console.log($scope.pillName);
      $scope.isVisible.suggestions = false;
    };

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch(query) {
      // returns list of filtered items
      return query ? $scope.items.filter(createFilterFor(query)) : [];
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(item) {
        // Check if the given item matches for the given query
        var label = angular.lowercase(item.label);
        return (label.indexOf(lowercaseQuery) === 0);
      };
    }

  });