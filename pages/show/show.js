// pages/show/show.js
Page({

  /**
   * Page initial data
   */
  data: {

  },

  setDisplayDate: function (story) {
    let date = new Date(story.date)
    story.display_day = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    story.display_time = [date.getHours(), date.getMinutes()].map(this.formatNumber).join(':')
    return story
  },

  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  setStory(id) {
    let Story = new wx.BaaS.TableObject('story')
    Story.get(id.toString()).then(res => {
      let story = res.data;
      story = this.setDisplayDate(story)
      this.setData({ story })
    }, err => {
    })
  },

  getUserStory: function (storyId, userId) {
    let query = new wx.BaaS.Query()
    let UserStory = new wx.BaaS.TableObject('user_story')

    query.compare('story', '=', storyId)
    query.compare('user', '=', userId)
    query.compare('visible', '=', true)
    UserStory.setQuery(query).find().then(res => {
      if (res.data.objects.length !== 0) {
        let userStory = res.data.objects[0];
        this.setData({ userStory }) // Saving User story to local page data
      }
    })
  },

  unsaveUserStory: function () {
    let story = this.data.story // (1) decrease "people_saved" of Story object
    let peopleSaved = story.people_saved
    peopleSaved -= 1

    let Story = new wx.BaaS.TableObject('story') // (2) update 'people_saved' to Story object in data base
    let dbStory = Story.getWithoutData(story.id)
    dbStory.set("people_saved", peopleSaved)
    dbStory.update().then(res => {
      let story = res.data
      story = this.setDisplayDate(story) // (3) add display data format for Story object
      this.setData({ story }) // (4) set updated Story object in local page data
    }, err => {
    })

    let userStory = this.data.userStory
    userStory.saved = false // (5) change 'saved' attribute in UserStory object

    let UserStory = new wx.BaaS.TableObject('user_story')
    let dbUserStory = UserStory.getWithoutData(userStory.id)
    dbUserStory.set("saved", userStory.saved) // (6) update 'saved' to UserStory object in data base
    dbUserStory.update().then(res => {
      let userStory = res.data
      this.setData({ userStory }) // (7) set updated UserStory object in local page data
      // this.getUserStories(this.data.story.id) // (8) get UserStories --- for avatar display
    }, err => {
    })

    wx.showToast({
      title: `成功取消收藏`,
      icon: 'success'
    })
  },

  saveUserStory: function () {
    let story = this.data.story // (1) increase "people_saved" of Story object
    let peopleSaved = story.people_saved
    peopleSaved += 1

    let Story = new wx.BaaS.TableObject('story') // (2) update 'people_saved' to Story object in data base
    let dbStory = Story.getWithoutData(story.id)
    dbStory.set("people_saved", peopleSaved)
    dbStory.update().then(res => {
      let story = res.data
      story = this.setDisplayDate(story) // (3) add display data format for Story object
      this.setData({ story }) // (4) set updated Story object in local page data
    }, err => {
    })

    if (this.data.userStory) { // (5a) updating "saved" to true in DB, if UserStory already exists
      let userStory = this.data.userStory
      userStory.saved = true

      let UserStory = new wx.BaaS.TableObject('user_story') // (6a) update 'saved' to UserStory object in data base
      let dbUserStory = UserStory.getWithoutData(userStory.id)
      dbUserStory.set("saved", userStory.saved)
      dbUserStory.update().then(res => {
        let userStory = res.data
        this.setData({ userStory }) // (7a) set updated UserStory Object in local page data
        // this.getUserStories(this.data.story.id) // (8a) get UserStories --- for avatar display
      }, err => {
      })

    } else { // Creating new UserStory and saving into DB, if User Story does not exist yet

      let UserStory = new wx.BaaS.TableObject('user_story')
      let userStory = UserStory.create()
      let newUserStory = { // (5b) creating new UserStory object with 'saved' = true
        user: this.data.user.id,
        story: this.data.story.id,
        saved: true
      }
      userStory.set(newUserStory).save().then(res => { // (6b) saving new UserStory object into DB
        let userStory = res.data
        this.setData({ userStory }) // (7b) setting UserStory Object in local page data
        // this.getUserStories(this.data.story.id) // (8b) getting UserStories --- for avatar display
      }, err => {
      })
    }
    wx.showToast({
      title: `已成功收藏！`,
      icon: 'success'
    })
  },


  unlikeUserStory: function () {
    let story = this.data.story // (1) decrease "people_liked" of Story object
    let peopleLiked = story.people_liked
    peopleLiked -= 1

    let Story = new wx.BaaS.TableObject('story') // (2) update 'people_liked' to Story object in data base
    let dbStory = Story.getWithoutData(story.id)
    dbStory.set("people_liked", peopleLiked)
    dbStory.update().then(res => {
      let story = res.data
      story = this.setDisplayDate(story) // (3) add display data format for Story object
      this.setData({ story }) // (4) set updated Story object in local page data
    }, err => {
    })

    let userStory = this.data.userStory
    userStory.liked = false // (5) change 'liked' attribute in UserStory object

    let UserStory = new wx.BaaS.TableObject('user_story')
    let dbUserStory = UserStory.getWithoutData(userStory.id)
    dbUserStory.set("liked", userStory.liked) // (6) update 'liked' to UserStory object in data base
    dbUserStory.update().then(res => {
      let userStory = res.data
      this.setData({ userStory }) // (7) set updated UserStory object in local page data
      // this.getUserStories(this.data.story.id) // (8) get UserStories --- for avatar display
    }, err => {
    })

    wx.showToast({
      title: `取消喜欢`,
      icon: 'success'
    })
  },



  likeUserStory: function () {
    let story = this.data.story // (1) increase "people_liked" of Story object
    let peopleLiked = story.people_liked
    peopleLiked += 1

    let Story = new wx.BaaS.TableObject('story') // (2) update 'people_liked' to Story object in data base
    let dbStory = Story.getWithoutData(story.id)
    dbStory.set("people_liked", peopleLiked)
    dbStory.update().then(res => {
      let story = res.data
      story = this.setDisplayDate(story) // (3) add display data format for Story object
      this.setData({ story }) // (4) set updated Story object in local page data
    }, err => {
    })

    if (this.data.userStory) { // (5a) updating "liked" to true in DB, if UserStory already exists
      let userStory = this.data.userStory
      userStory.liked = true

      let UserStory = new wx.BaaS.TableObject('user_story') // (6a) update 'liked' to UserStory object in data base
      let dbUserStory = UserStory.getWithoutData(userStory.id)
      dbUserStory.set("liked", userStory.liked)
      dbUserStory.update().then(res => {
        let userStory = res.data
        this.setData({ userStory }) // (7a) set updated UserStory Object in local page data
        // this.getUserStories(this.data.story.id) // (8a) get UserStories --- for avatar display
      }, err => {
      })

    } else { // Creating new UserStory and saving into DB, if User Story does not exist yet

      let UserStory = new wx.BaaS.TableObject('user_story')
      let userStory = UserStory.create()
      let newUserStory = { // (5b) creating new UserStory object with 'liked' = true
        user: this.data.user.id,
        story: this.data.story.id,
        liked: true
      }
      userStory.set(newUserStory).save().then(res => { // (6b) saving new UserStory object into DB
        let userStory = res.data
        this.setData({ userStory }) // (7b) setting UserStory Object in local page data
        // this.getUserStories(this.data.story.id) // (8b) getting UserStories --- for avatar display
      }, err => {
      })
    }
    wx.showToast({
      title: `已喜欢！`,
      icon: 'success'
    })
  },

  navigateToHome: function () {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  openLocation: function () {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  deleteUserStory: function (userStoryId) {
    let UserStory = new wx.BaaS.TableObject('user_story')
    let dbUserStory = UserStory.getWithoutData(userStoryId)
    dbUserStory.set("visible", false)
    dbUserStory.update().then(res => {}, err => {})
  },

  deleteUserStories: function (storyId) {
    console.log("entered delete UserStories")
    let query = new wx.BaaS.Query()
    let UserStory = new wx.BaaS.TableObject('user_story')
    query.compare('story', '=', storyId)
    console.log("ready for query...")
    UserStory.setQuery(query).find().then(res => {
      let userStories = res.data.objects;
      console.log("entered pre Iteration")
      userStories.forEach((userStory) => {
        this.deleteUserStory(userStory.id)
      })
    })
  },

  deleteStory: function () {
    let Story = new wx.BaaS.TableObject('story')
    let story = this.data.story
    let dbStory = Story.getWithoutData(story.id)
    dbStory.set("visible", false)
    dbStory.update().then(res => {
      // success
      let storyId = this.data.story.id
      // ********************************** delete comments
      this.deleteUserStories(storyId)
      wx.showToast({
        title: `城事已删掉！`,
        icon: 'success'
      })
      this.navigateToHome()
    }, err => {
      // err
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    
    let storyId = options.id // Setting storyId from Page properties
    this.setStory(storyId) // setting Story object by search with Story ID in local page data
    
    wx.BaaS.auth.getCurrentUser().then(user => { // Getting current_user information
      this.setData({ user })  // Saving User object to local page data
      this.getUserStory(storyId, user.id)
      // this.getUserStories(storyId) // getting UserStories --- for avatar display
    }).catch(err => {
      // HError
      if (err.code === 604) {
        console.log('用户未登录')
      }
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})