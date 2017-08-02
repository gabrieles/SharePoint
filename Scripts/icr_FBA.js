// code from https://social.msdn.microsoft.com/Forums/sharepoint/en-US/d4c6cc77-a36b-44fa-b02d-2f9d3ad59f0f/adding-fba-user-to-sharepoint-group

function CreateUser(txtUserName.Text, pwd.Text, txtEmail.Text, company.Text, "OnMobile", true, out status) {
try {
	SPSecurity.RunWithElevatedPrivileges(delegate {
		using (SPSite site = new SPSite(SPContext.Current.Web.Url)){
			using (SPWeb web = site.OpenWeb()){
		
				//MembershipUser User = Membership.GetUser(txtUserName.Text);

				string usernameWithProvider = "i:0#.f|aspnetsqlmembershipprovider|" + txtUserName.Text;
				web.SiteUsers.Add(userName, txtEmail.Text, txtLastName.Text + "," + txtFirstName.Text, "");
				spuser = web.Users[usernameWithProvider];
				AddUserToGroup(SP_Web,spUser, "")
			}
		}
	});
} 
catch (Exception ex){
	lblMessage.Text = ex.Message.ToString();
}
						
}

function AddUserToGroup(SP_Web, userObj, groupName) {
	spGroup = web.Groups[groupName];

	if (userObj != null && spGroup != null) { 
		SP_Web.AllowUnsafeUpdates = true;
		spGroup.AddUser(userObj); 
		SP_Web.Update();
		SP_Web.AllowUnsafeUpdates = false;
	}
}