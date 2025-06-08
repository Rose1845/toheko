{/* Edit Group Form Dialog */}
<Dialog open={showEditForm} onOpenChange={setShowEditForm}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Edit Group</DialogTitle>
      <DialogDescription>
        Update the group details.
      </DialogDescription>
    </DialogHeader>
    <Form {...groupForm}>
      <form onSubmit={groupForm.handleSubmit(onSubmitEdit)} className="space-y-4">
        {/* Modified form fields - removed group type and registration number */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={groupForm.control}
            name="groupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter group name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={groupForm.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 0712345678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={groupForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="group@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={groupForm.control}
            name="physicalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter physical address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Officials section removed as they are now managed separately */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEditForm(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isEditLoading}>
            {isEditLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Group"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
