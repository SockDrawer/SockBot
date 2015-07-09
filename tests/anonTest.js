var anonModule = require('../sock_modules/anonymize.js');
var discourse = require('../discourse.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe("Anonymize module", function() {
	var sandbox, discoMock;

	var fakePost = {
		raw: "[quote=\"Kian, post:335, topic:49371\"] blah blah blah [/quote] I am a reply!",
		cleaned: "I am a reply!",
		topic_id: 1776
	};

	var fakeNotification = {
		topic_id: 1776,
		post_number: 7
	}
		
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	  discoMock = {
	  	log: sandbox.stub(discourse, "log"),
	  	createPost: sandbox.stub(discourse, "createPost")

	  };

	  var conf = {
	  	modules: {
	  		Anonymize: {
	  			enabled: true
	  		}
	  	}
	  }
	  anonModule.begin(discoMock, conf);
	});
		
	afterEach(function() {
		sandbox.restore();
	});

	it("should not run if disabled", function(done) {
		//Reset to disable
		var conf = {
			modules: {
				Anonymize: {
					enabled: false
				}
			}
		}
		anonModule.begin(discoMock, conf);

		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");

		anonModule.onNotify("private_message",fakeNotification,"",fakePost,function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should not run if called outside of a privmsg", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");

		anonModule.onNotify("public_msg",fakeNotification,"",fakePost,function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should not run without a post", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");

		anonModule.onNotify("private_message",fakeNotification,"",undefined,function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should not run with an unclean post", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");

		anonModule.onNotify("private_message",fakeNotification,"",{},function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should not anon to itself", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");
		var fakePost = {
			//The below is altered to use the same topic ID as the notification mock
			raw: "[quote=\"Kian, post:335, topic:1776\"] blah blah blah [/quote] I am a reply!",
			cleaned: "I am a reply!",
			topic_id: 1776
		};


		anonModule.onNotify("private_message",fakeNotification,"",fakePost,function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should not anon without a quote", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg");
		var fakePost = {
			//The below is altered to remove the quote
			raw: "I am a reply!",
			cleaned: "I am a reply!",
			topic_id: 1776
		};


		anonModule.onNotify("private_message",fakeNotification,"",fakePost,function() {
			assert(!mockImpl.called, "Implementation was called!");
			done();
		})
	})

	it("should anon when the stars align", function(done) {
		var mockImpl = sandbox.stub(anonModule,"doAnonMsg").yields();

		anonModule.onNotify("private_message",fakeNotification,"",fakePost,function() {
			assert(mockImpl.called, "Implementation was not called!");
			done();
		})
	})



	describe("doAnonMsg", function() {
		
		it("should log the message", function(done) {
			var match = {
				topic_id: 1000,
				post_number: 69,
				raw: "Please post for me!"
			};

			var notification = {
				topic_id: 1776,
				post_number: 7
			}

			discourse.createPost.yields();

			anonModule.doAnonMsg(match, fakeNotification, function() {
				assert(discoMock.log.called);
				assert(discoMock.log.calledWith('Posting anonymously to 1000'));
				done();
			})
		});

		it("should send the anonymous message", function(done) {
			var match = {
				topic_id: 1000,
				post_number: 69,
				raw: "Please post for me!"
			};
			discourse.createPost.yields();

			anonModule.doAnonMsg(match, fakeNotification, function() {
				assert(discoMock.createPost.called);
				assert(discoMock.createPost.calledWith(match.topic_id, match.post_number, match.raw));
				done();
			})
		});

		it("should reply to the user", function(done) {
			var match = {
				topic_id: 1000,
				post_number: 69,
				raw: "Please post for me!"
			};

			var expectedArgs = [1776,7,'Anonymizied Reply Sent. Thank you for using Anonymizer, a SockIndustries application.']
			discourse.createPost.yields();
			var clock = sinon.useFakeTimers();


			anonModule.doAnonMsg(match, fakeNotification, function() {
				clock.tick(510);
				assert(discoMock.createPost.calledTwice);
				assert.equal(discoMock.createPost.getCall(1).args[0],expectedArgs[0]);
				assert.equal(discoMock.createPost.getCall(1).args[1],expectedArgs[1]);
				assert.equal(discoMock.createPost.getCall(1).args[2],expectedArgs[2]);
				clock.restore();
				done();
			})
		});
	});
})
